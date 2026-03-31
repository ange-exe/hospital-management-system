import { useEffect, useRef, useState, useCallback } from "react";
import {
  doc, setDoc, getDoc, addDoc,
  collection, onSnapshot, updateDoc, serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";

// Google's public STUN servers — free, no setup needed
const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

export function useWebRTC({ appointmentId, userId, userName, role }) {
  const [localStream, setLocalStream]   = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callStatus, setCallStatus]     = useState("idle"); // idle | calling | active | ended
  const [messages, setMessages]         = useState([]);
  const [isMuted, setIsMuted]           = useState(false);
  const [isCamOff, setIsCamOff]         = useState(false);

  const pc = useRef(null); // RTCPeerConnection

  const callRef = useCallback(
    () => doc(db, "calls", appointmentId),
    [appointmentId]
  );

  // ── 1. Get camera + mic ───────────────────────────────────────────────────
  const startLocalStream = useCallback(async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true, audio: true,
    });
    setLocalStream(stream);
    return stream;
  } catch (err) {
    if (err.name === "NotAllowedError") {
      alert("Camera/mic permission denied. Please allow access in your browser and try again.");
    } else {
      alert("Could not access camera/mic: " + err.message);
    }
    throw err;
  }
}, []);

  // ── 2. Create peer connection ─────────────────────────────────────────────
  const createPeerConnection = useCallback((stream) => {
    const peerConnection = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks to connection
    stream.getTracks().forEach((track) =>
      peerConnection.addTrack(track, stream)
    );

    // Listen for remote tracks
    const remote = new MediaStream();
    peerConnection.ontrack = (e) => {
      e.streams[0].getTracks().forEach((track) => remote.addTrack(track));
    };
    setRemoteStream(remote);

    pc.current = peerConnection;
    return peerConnection;
  }, []);

  // ── 3. Start call (caller side) ───────────────────────────────────────────
  const startCall = useCallback(async () => {
    const stream = await startLocalStream();
    const peerConnection = createPeerConnection(stream);

    const callerCandidatesRef = collection(callRef(), "callerCandidates");

    // Save ICE candidates as they are found
    peerConnection.onicecandidate = ({ candidate }) => {
      if (candidate) addDoc(callerCandidatesRef, candidate.toJSON());
    };

    // Create offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    await setDoc(callRef(), {
      appointmentId,
      status: "calling",
      offer: { sdp: offer.sdp, type: offer.type },
      createdAt: serverTimestamp(),
    });

    setCallStatus("calling");

    // Listen for answer
    onSnapshot(callRef(), async (snap) => {
  const data = snap.data();
  if (!peerConnection.currentRemoteDescription && data?.answer) {
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(data.answer)
    );
    setCallStatus("active");
  }
  if (data?.status === "ended") {
    pc.current?.close();
    localStream?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);
    setRemoteStream(null);
    setCallStatus("ended");
  }
});
    // Listen for remote ICE candidates
    onSnapshot(collection(callRef(), "answerCandidates"), (snap) => {
      snap.docChanges().forEach(({ type, doc }) => {
        if (type === "added") {
          peerConnection.addIceCandidate(new RTCIceCandidate(doc.data()));
        }
      });
    });
  }, [appointmentId, startLocalStream, createPeerConnection, callRef]);

  // ── 4. Answer call (receiver side) ───────────────────────────────────────
  const answerCall = useCallback(async () => {
    const stream = await startLocalStream();
    const peerConnection = createPeerConnection(stream);

    const answerCandidatesRef = collection(callRef(), "answerCandidates");

    peerConnection.onicecandidate = ({ candidate }) => {
      if (candidate) addDoc(answerCandidatesRef, candidate.toJSON());
    };

    const callData = (await getDoc(callRef())).data();
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(callData.offer)
    );

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    await updateDoc(callRef(), {
      answer: { sdp: answer.sdp, type: answer.type },
      status: "active",
    });

    setCallStatus("active");

    // Listen for caller ICE candidates
    onSnapshot(collection(callRef(), "callerCandidates"), (snap) => {
      snap.docChanges().forEach(({ type, doc }) => {
        if (type === "added") {
          peerConnection.addIceCandidate(new RTCIceCandidate(doc.data()));
        }
      });
    });

    // Listen for call end
    onSnapshot(callRef(), (snap) => {
  if (snap.data()?.status === "ended") {
    pc.current?.close();
    localStream?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);
    setRemoteStream(null);
    setCallStatus("ended");
  }
});
  }, [appointmentId, startLocalStream, createPeerConnection, callRef]);

  // ── 5. End call ───────────────────────────────────────────────────────────
  const endCall = useCallback(async () => {
    pc.current?.getTracks?.()?.forEach?.((t) => t.stop());
    pc.current?.close();
    localStream?.getTracks().forEach((t) => {
      t.stop();
      t.enabled = false;
    });
    if (localVideoRef?.current) localVideoRef.current.srcObject = null;
    setLocalStream(null);
    setRemoteStream(null);
    setCallStatus("ended");
    await updateDoc(callRef(), { status: "ended" }).catch(() => {});
  }, [localStream, callRef]);
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
          .sort((a, b) => a.timestamp?.seconds - b.timestamp?.seconds);
        setMessages(msgs);
      }
    );
    return unsub;
  }, [appointmentId]);

  // ── 8. Toggle mute / camera ───────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    localStream?.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setIsMuted((prev) => !prev);
  }, [localStream]);

  const toggleCamera = useCallback(() => {
    localStream?.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setIsCamOff((prev) => !prev);
  }, [localStream]);

  return {
    localStream, remoteStream,
    callStatus,
    messages, sendMessage,
    startCall, answerCall, endCall,
    isMuted, toggleMute,
    isCamOff, toggleCamera,
  };
}