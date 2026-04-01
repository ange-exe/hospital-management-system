import { useEffect, useRef, useState, useCallback } from "react";
import {
  doc, setDoc, getDoc, addDoc,
  collection, onSnapshot, updateDoc, serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";

// ✅ TURN servers added — STUN alone fails when both peers are behind NAT/routers.
// Free credentials from Open Relay Project. For production use your own from metered.ca.
const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
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
  const [localStream,  setLocalStream]  = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callStatus,   setCallStatus]   = useState("idle");
  const [messages,     setMessages]     = useState([]);
  const [isMuted,      setIsMuted]      = useState(false);
  const [isCamOff,     setIsCamOff]     = useState(false);

  const pcRef           = useRef(null);
  const localStreamRef  = useRef(null);
  const remoteStreamRef = useRef(new MediaStream());
  const unsubsRef       = useRef([]);
  const pendingICERef   = useRef([]);
  const remoteSetRef    = useRef(false);

  const getCallRef = useCallback(() => {
    if (!appointmentId) { console.warn("useWebRTC: appointmentId not set"); return null; }
    return doc(db, "calls", appointmentId);
  }, [appointmentId]);

  const drainPendingICE = useCallback(async (pc) => {
    const candidates = [...pendingICERef.current];
    pendingICERef.current = [];
    for (const c of candidates) {
      try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch (_) {}
    }
  }, []);

  const safeAddICE = useCallback(async (pc, candidateData) => {
    if (!pc || pc.signalingState === "closed") return;
    if (!remoteSetRef.current) { pendingICERef.current.push(candidateData); return; }
    try { await pc.addIceCandidate(new RTCIceCandidate(candidateData)); } catch (_) {}
  }, []);

  const cleanup = useCallback(() => {
    unsubsRef.current.forEach(u => u());
    unsubsRef.current = [];
    if (pcRef.current) {
      pcRef.current.ontrack                 = null;
      pcRef.current.onicecandidate          = null;
      pcRef.current.oniceconnectionstatechange = null;
      pcRef.current.onconnectionstatechange = null;
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    remoteStreamRef.current.getTracks().forEach(t => remoteStreamRef.current.removeTrack(t));
    remoteSetRef.current  = false;
    pendingICERef.current = [];
    setLocalStream(null);
    setRemoteStream(null);
  }, []);

  const startLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (err) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError")
        alert("Camera/mic permission denied. Please allow access in your browser settings.");
      else if (err.name === "NotFoundError")
        alert("No camera or microphone found.");
      else
        alert("Could not access camera/mic: " + err.message);
      throw err;
    }
  }, []);

  const createPeerConnection = useCallback((stream) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    pc.ontrack = (e) => {
      console.log("ontrack fired, kind:", e.track.kind);
      const existing = remoteStreamRef.current.getTracks().map(t => t.id);
      if (!existing.includes(e.track.id)) {
        remoteStreamRef.current.addTrack(e.track);
        console.log("Added remote track:", e.track.kind);
      }
      setRemoteStream(remoteStreamRef.current);
    };

    // ✅ Watch both — Chrome fires onconnectionstatechange, Firefox fires oniceconnectionstatechange
    pc.oniceconnectionstatechange = () => {
      const s = pc.iceConnectionState;
      console.log("ICE connection state:", s);
      if (s === "connected" || s === "completed") setCallStatus("active");
      if (s === "failed") pc.restartIce?.();
    };

    pc.onconnectionstatechange = () => {
      const s = pc.connectionState;
      console.log("Connection state:", s);
      if (s === "connected") setCallStatus("active");
    };

    pc.onsignalingstatechange = () => console.log("Signaling state:", pc.signalingState);

    pcRef.current = pc;
    return pc;
  }, []);

  // ── Start call (caller / doctor) ──────────────────────────────────────────

  const startCall = useCallback(async () => {
    const callRef = getCallRef();
    if (!callRef) return;
    cleanup();
    remoteSetRef.current = false;

    const stream = await startLocalStream();
    const pc     = createPeerConnection(stream);

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) addDoc(collection(callRef, "callerCandidates"), candidate.toJSON());
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    await setDoc(callRef, {
      appointmentId,
      status:    "calling",
      offer:     { sdp: offer.sdp, type: offer.type },
      createdAt: serverTimestamp(),
      doctorName: userName,  // ← saved so patient panel can display it
    });
    setCallStatus("calling");

    const unsubCall = onSnapshot(callRef, async (snap) => {
      const data = snap.data();
      if (!data) return;
      if (!remoteSetRef.current && data.answer) {
        remoteSetRef.current = true;
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
          await drainPendingICE(pc);
        } catch (e) { console.error("setRemoteDescription error:", e); }
      }
      if (data.status === "ended") { cleanup(); setCallStatus("ended"); }
    });

    const unsubICE = onSnapshot(collection(callRef, "answerCandidates"), (snap) => {
      snap.docChanges().forEach(({ type, doc: d }) => {
        if (type === "added") safeAddICE(pc, d.data());
      });
    });

    unsubsRef.current.push(unsubCall, unsubICE);
  }, [appointmentId, getCallRef, startLocalStream, createPeerConnection, cleanup, drainPendingICE, safeAddICE]);

  // ── Answer call (receiver / patient) ─────────────────────────────────────

  const answerCall = useCallback(async () => {
    const callRef = getCallRef();
    if (!callRef) return;
    cleanup();
    remoteSetRef.current = false;

    const callSnap = await getDoc(callRef);
    const callData = callSnap.data();
    if (!callData?.offer) { alert("No active call found. Ask the doctor to start the call first."); return; }

    const stream = await startLocalStream();
    const pc     = createPeerConnection(stream);

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) addDoc(collection(callRef, "answerCandidates"), candidate.toJSON());
    };

    await pc.setRemoteDescription(new RTCSessionDescription(callData.offer));
    remoteSetRef.current = true;
    await drainPendingICE(pc);

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    await updateDoc(callRef, { answer: { sdp: answer.sdp, type: answer.type }, status: "active" });
    setCallStatus("active");

    const unsubICE = onSnapshot(collection(callRef, "callerCandidates"), (snap) => {
      snap.docChanges().forEach(({ type, doc: d }) => {
        if (type === "added") safeAddICE(pc, d.data());
      });
    });
    const unsubCall = onSnapshot(callRef, (snap) => {
      if (snap.data()?.status === "ended") { cleanup(); setCallStatus("ended"); }
    });
    unsubsRef.current.push(unsubICE, unsubCall);
  }, [getCallRef, startLocalStream, createPeerConnection, cleanup, drainPendingICE, safeAddICE]);

  // ── End call ──────────────────────────────────────────────────────────────

  const endCall = useCallback(async () => {
    const callRef = getCallRef();
    cleanup();
    setCallStatus("ended");
    if (callRef) await updateDoc(callRef, { status: "ended" }).catch(() => {});
  }, [getCallRef, cleanup]);

  // ── Chat ──────────────────────────────────────────────────────────────────

  const sendMessage = useCallback(async (text) => {
    const callRef = getCallRef();
    if (!callRef) return;
    await addDoc(collection(callRef, "messages"), {
      text, sender: userId, senderName: userName, timestamp: serverTimestamp(),
    });
  }, [getCallRef, userId, userName]);

  useEffect(() => {
    if (!appointmentId) return;
    const unsub = onSnapshot(collection(doc(db, "calls", appointmentId), "messages"), (snap) => {
      setMessages(snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.timestamp?.seconds ?? 0) - (b.timestamp?.seconds ?? 0)));
    });
    return unsub;
  }, [appointmentId]);

  // ── Mute / Camera ─────────────────────────────────────────────────────────

  const toggleMute = useCallback(() => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setIsMuted(p => !p);
  }, []);

  const toggleCamera = useCallback(() => {
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setIsCamOff(p => !p);
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  return {
    localStream, remoteStream, remoteStreamRef,
    callStatus,
    messages, sendMessage,
    startCall, answerCall, endCall,
    isMuted, toggleMute,
    isCamOff, toggleCamera,
  };
}