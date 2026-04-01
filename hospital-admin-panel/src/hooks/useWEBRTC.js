import { useEffect, useRef, useState, useCallback } from "react";
import {
  doc, setDoc, getDoc, addDoc,
  collection, onSnapshot, updateDoc, serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443?transport=tcp",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
};

export function useWebRTC({ appointmentId, userId, userName, role }) {
  const [localStream, setLocalStream]   = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callStatus, setCallStatus]     = useState("idle");
  const [messages, setMessages]         = useState([]);
  const [isMuted, setIsMuted]           = useState(false);
  const [isCamOff, setIsCamOff]         = useState(false);

  const pc              = useRef(null);
  const localStreamRef  = useRef(null); // ← mirror of localStream for use inside callbacks
  const iceCandidates   = useRef([]);
  const remoteDescSet   = useRef(false);

  const callRef = useCallback(
    () => doc(db, "calls", appointmentId),
    [appointmentId]
  );

  // ── Helper: safely add ICE candidate ─────────────────────────────────────
  const safeAddIceCandidate = useCallback(async (peerConnection, candidate) => {
    if (!peerConnection || peerConnection.signalingState === "closed") return;
    if (remoteDescSet.current && peerConnection.remoteDescription) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.warn("ICE candidate error (ignored):", e.message);
      }
    } else {
      iceCandidates.current.push(candidate);
    }
  }, []);

  // ── Helper: flush queued ICE candidates ──────────────────────────────────
  const flushIceCandidates = useCallback(async (peerConnection) => {
    remoteDescSet.current = true;
    for (const candidate of iceCandidates.current) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.warn("Queued ICE candidate error (ignored):", e.message);
      }
    }
    iceCandidates.current = [];
  }, []);

  // ── 1. Get camera + mic ───────────────────────────────────────────────────
  const startLocalStream = useCallback(async () => {
    // Stop any existing tracks first
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true, audio: true,
    });
    localStreamRef.current = stream; // ← keep ref in sync
    setLocalStream(stream);
    return stream;
  }, []);

  // ── 2. Create peer connection ─────────────────────────────────────────────
  const createPeerConnection = useCallback((stream) => {
    const peerConnection = new RTCPeerConnection(ICE_SERVERS);

    stream.getTracks().forEach((track) =>
      peerConnection.addTrack(track, stream)
    );

    const remote = new MediaStream();
    peerConnection.ontrack = (e) => {
      const track = e.track;
      if (!remote.getTracks().find((t) => t.id === track.id)) {
        remote.addTrack(track);
      }
      setRemoteStream(new MediaStream(remote.getTracks()));
    };

    peerConnection.onconnectionstatechange = () => {
      console.log("[WebRTC] connection state:", peerConnection.connectionState);
    };

    peerConnection.oniceconnectionstatechange = () => {
      console.log("[WebRTC] ICE state:", peerConnection.iceConnectionState);
    };

    pc.current = peerConnection;
    remoteDescSet.current = false;
    iceCandidates.current = [];
    return peerConnection;
  }, []);

  // ── 3. Start call (doctor / admin side) ──────────────────────────────────
  const startCall = useCallback(async () => {
    const stream = await startLocalStream();
    const peerConnection = createPeerConnection(stream);

    const callerCandidatesRef = collection(callRef(), "callerCandidates");

    peerConnection.onicecandidate = ({ candidate }) => {
      if (candidate) addDoc(callerCandidatesRef, candidate.toJSON());
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    await setDoc(callRef(), {
      appointmentId,
      status: "calling",
      offer: { sdp: offer.sdp, type: offer.type },
      createdAt: serverTimestamp(),
    });

    setCallStatus("calling");

    onSnapshot(callRef(), async (snap) => {
      const data = snap.data();
      if (
        !remoteDescSet.current &&
        data?.answer &&
        peerConnection.signalingState !== "closed"
      ) {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );
        await flushIceCandidates(peerConnection);
        setCallStatus("active");
      }
      if (data?.status === "ended") {
        pc.current?.close();
        setLocalStream(null);
        setRemoteStream(null);
        setCallStatus("ended");
      }
    });

    onSnapshot(collection(callRef(), "answerCandidates"), (snap) => {
      snap.docChanges().forEach(({ type, doc }) => {
        if (type === "added") safeAddIceCandidate(peerConnection, doc.data());
      });
    });
  }, [appointmentId, startLocalStream, createPeerConnection, callRef, flushIceCandidates, safeAddIceCandidate]);

  // ── 4. Answer call (patient side) ─────────────────────────────────────────
  const answerCall = useCallback(async () => {
    const stream = await startLocalStream();
    const peerConnection = createPeerConnection(stream);

    const answerCandidatesRef = collection(callRef(), "answerCandidates");

    peerConnection.onicecandidate = ({ candidate }) => {
      if (candidate) addDoc(answerCandidatesRef, candidate.toJSON());
    };

    const callData = (await getDoc(callRef())).data();
    if (!callData?.offer) {
      console.error("No offer found in call document!");
      return;
    }

    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(callData.offer)
    );
    await flushIceCandidates(peerConnection);

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    await updateDoc(callRef(), {
      answer: { sdp: answer.sdp, type: answer.type },
      status: "active",
    });

    setCallStatus("active");

    onSnapshot(collection(callRef(), "callerCandidates"), (snap) => {
      snap.docChanges().forEach(({ type, doc }) => {
        if (type === "added") safeAddIceCandidate(peerConnection, doc.data());
      });
    });

    onSnapshot(callRef(), (snap) => {
      if (snap.data()?.status === "ended") {
        pc.current?.close();
        setLocalStream(null);
        setRemoteStream(null);
        setCallStatus("ended");
      }
    });
  }, [appointmentId, startLocalStream, createPeerConnection, callRef, flushIceCandidates, safeAddIceCandidate]);

  // ── 5. End call ───────────────────────────────────────────────────────────
  const endCall = useCallback(async () => {
    // 1. Stop all sender tracks (turns off camera/mic indicator light)
    pc.current?.getSenders().forEach((s) => {
      if (s.track) s.track.stop();
    });

    // 2. Also stop directly from the stream ref (belt-and-suspenders)
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    // 3. Close the peer connection
    pc.current?.close();
    pc.current = null;

    // 4. Clear state
    setLocalStream(null);
    setRemoteStream(null);
    setCallStatus("ended");
    setIsMuted(false);
    setIsCamOff(false);
    remoteDescSet.current = false;
    iceCandidates.current = [];

    // 5. Update Firestore
    try {
      const snap = await getDoc(callRef());
      if (snap.exists()) {
        await updateDoc(callRef(), { status: "ended" });
      }
    } catch (e) {
      console.warn("endCall cleanup error (ignored):", e.message);
    }
  }, [callRef]);
  // ← note: removed `localStream` from deps, we use localStreamRef instead

  // ── 6. Send chat message ──────────────────────────────────────────────────
  const sendMessage = useCallback(async (text) => {
    await addDoc(collection(callRef(), "messages"), {
      text,
      sender: userId,
      senderName: userName,
      timestamp: serverTimestamp(),
    });
  }, [callRef, userId, userName]);

  // ── 7. Listen to chat messages ────────────────────────────────────────────
  useEffect(() => {
    if (!appointmentId) return;
    const unsub = onSnapshot(
      collection(doc(db, "calls", appointmentId), "messages"),
      (snap) => {
        const msgs = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (a.timestamp?.seconds ?? 0) - (b.timestamp?.seconds ?? 0));
        setMessages(msgs);
      }
    );
    return unsub;
  }, [appointmentId]);

  // ── 8. Cleanup on unmount ─────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      // If component unmounts without calling endCall, still kill the camera
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
      pc.current?.getSenders().forEach((s) => s.track?.stop());
      pc.current?.close();
    };
  }, []);

  // ── 9. Toggle mute / camera ───────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setIsMuted((prev) => !prev);
  }, []);

  const toggleCamera = useCallback(() => {
    localStreamRef.current?.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setIsCamOff((prev) => !prev);
  }, []);

  return {
    localStream, remoteStream,
    callStatus,
    messages, sendMessage,
    startCall, answerCall, endCall,
    isMuted, toggleMute,
    isCamOff, toggleCamera,
  };
}