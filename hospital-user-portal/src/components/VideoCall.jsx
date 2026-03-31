import React, { useEffect, useRef, useState } from "react";
import { useWebRTC } from "../hooks/useWEBRTC";

export default function VideoCall({ appointment, currentUser, onClose }) {
  const {
    localStream, remoteStream,
    callStatus,
    messages, sendMessage,
    startCall, answerCall, endCall,
    isMuted, toggleMute,
    isCamOff, toggleCamera,
  } = useWebRTC({
    appointmentId: appointment.id,
    userId: currentUser.uid,
    userName: currentUser.displayName ?? currentUser.email,
    role: currentUser.role,
  });

  const localVideoRef  = useRef(null);
  const remoteVideoRef = useRef(null);
  const chatEndRef     = useRef(null);
  const [chatInput, setChatInput] = useState("");

  // Attach streams to video elements
  useEffect(() => {
    if (localVideoRef.current && localStream)
      localVideoRef.current.srcObject = localStream;
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream)
      remoteVideoRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    await sendMessage(chatInput.trim());
    setChatInput("");
  };

  const handleEnd = async () => {
    await endCall();
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>

        {/* ── Header ── */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.dot(callStatus)} />
            <span style={styles.headerTitle}>
              {appointment.provider} — {appointment.patientName}
            </span>
          </div>
          <span style={styles.statusBadge(callStatus)}>
            {STATUS_LABEL[callStatus]}
          </span>
        </div>

        {/* ── Main content ── */}
        <div style={styles.body}>

          {/* Videos */}
          <div style={styles.videoSection}>
            {/* Remote */}
            <div style={styles.remoteWrap}>
              {remoteStream ? (
                <video ref={remoteVideoRef} autoPlay playsInline style={styles.remoteVideo} />
              ) : (
                <div style={styles.waitingScreen}>
                  <div style={styles.waitingIcon}>👨‍⚕️</div>
                  <p style={styles.waitingText}>
                    {callStatus === "idle"    && "Start or join the call"}
                    {callStatus === "calling" && "Waiting for other party…"}
                    {callStatus === "active"  && "Connecting video…"}
                    {callStatus === "ended"   && "Call ended"}
                  </p>
                </div>
              )}

              {/* Local (picture-in-picture) */}
              {localStream && (
                <div style={styles.localWrap}>
                  <video ref={localVideoRef} autoPlay playsInline muted style={styles.localVideo} />
                </div>
              )}
            </div>

            {/* Controls */}
            <div style={styles.controls}>
              {(callStatus === "idle" || callStatus === "ended") && (
  <>
    <button style={styles.btn("green")} onClick={startCall}>
      📞 Start Call
    </button>
    <button style={styles.btn("blue")} onClick={answerCall}>
      📲 Join Call
    </button>
    <button style={styles.btn("red")} onClick={onClose}>
      ✕ Cancel
    </button>
  </>
)}

              {(callStatus === "calling" || callStatus === "active") && (
                <>
                  <button
                    style={styles.btn(isMuted ? "yellow" : "gray")}
                    onClick={toggleMute}
                  >
                    {isMuted ? "🔇 Unmute" : "🎤 Mute"}
                  </button>
                  <button
                    style={styles.btn(isCamOff ? "yellow" : "gray")}
                    onClick={toggleCamera}
                  >
                    {isCamOff ? "📷 Cam On" : "📹 Cam Off"}
                  </button>
                  <button style={styles.btn("red")} onClick={handleEnd}>
                    📵 End Call
                  </button>
                </>
              )}

              {callStatus === "ended" && (
                <button style={styles.btn("gray")} onClick={onClose}>
                  ✖ Close
                </button>
              )}
            </div>
          </div>

          {/* ── Chat ── */}
          <div style={styles.chatSection}>
            <div style={styles.chatHeader}>💬 Chat</div>

            <div style={styles.chatMessages}>
              {messages.length === 0 && (
                <p style={styles.noMessages}>No messages yet</p>
              )}
              {messages.map((msg) => {
                const isMe = msg.sender === currentUser.uid;
                return (
                  <div key={msg.id} style={styles.msgRow(isMe)}>
                    {!isMe && (
                      <span style={styles.msgSender}>{msg.senderName}</span>
                    )}
                    <div style={styles.msgBubble(isMe)}>{msg.text}</div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSend} style={styles.chatForm}>
              <input
                style={styles.chatInput}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message…"
              />
              <button type="submit" style={styles.sendBtn}>Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Constants ────────────────────────────────────────────────────────────────
const STATUS_LABEL = {
  idle:    "Not started",
  calling: "Ringing…",
  active:  "● Live",
  ended:   "Ended",
};

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.75)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000,
  },
  container: {
    background: "#0d2137",
    borderRadius: 16,
    width: "min(95vw, 1000px)",
    height: "min(90vh, 640px)",
    display: "flex", flexDirection: "column",
    overflow: "hidden",
    boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
  },
  header: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 10 },
  headerTitle: { color: "#fff", fontWeight: 600, fontSize: 15 },
  dot: (status) => ({
    width: 10, height: 10, borderRadius: "50%",
    background: status === "active" ? "#38bd9c"
               : status === "calling" ? "#f59e0b"
               : "#6b7280",
  }),
  statusBadge: (status) => ({
    fontSize: 12, fontWeight: 600, padding: "4px 10px",
    borderRadius: 20,
    color: status === "active" ? "#38bd9c"
         : status === "calling" ? "#f59e0b"
         : "#9ca3af",
    border: `1px solid ${
      status === "active" ? "#38bd9c"
      : status === "calling" ? "#f59e0b"
      : "#374151"
    }`,
  }),
  body: {
    flex: 1, display: "flex", overflow: "hidden",
  },
  videoSection: {
    flex: 1, display: "flex", flexDirection: "column",
    background: "#060f1a",
  },
  remoteWrap: {
    flex: 1, position: "relative",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  remoteVideo: { width: "100%", height: "100%", objectFit: "cover" },
  waitingScreen: {
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: 12,
  },
  waitingIcon: { fontSize: 56 },
  waitingText: { color: "rgba(255,255,255,0.4)", fontSize: 14 },
  localWrap: {
    position: "absolute", bottom: 12, right: 12,
    width: 140, height: 100, borderRadius: 10,
    overflow: "hidden",
    border: "2px solid rgba(255,255,255,0.15)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
  },
  localVideo: { width: "100%", height: "100%", objectFit: "cover" },
  controls: {
    display: "flex", gap: 10, justifyContent: "center",
    padding: "14px 20px",
    background: "rgba(255,255,255,0.04)",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  btn: (color) => ({
    padding: "9px 18px", borderRadius: 8, border: "none",
    fontWeight: 600, fontSize: 13, cursor: "pointer",
    background:
      color === "green"  ? "#059669"
      : color === "red"  ? "#dc2626"
      : color === "blue" ? "#2563eb"
      : color === "yellow" ? "#d97706"
      : "#374151",
    color: "#fff",
    transition: "opacity 0.15s",
  }),
  chatSection: {
    width: 280, display: "flex", flexDirection: "column",
    borderLeft: "1px solid rgba(255,255,255,0.08)",
    background: "#0a1929",
  },
  chatHeader: {
    padding: "14px 16px",
    color: "#fff", fontWeight: 600, fontSize: 14,
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  chatMessages: {
    flex: 1, overflowY: "auto",
    padding: "12px 14px",
    display: "flex", flexDirection: "column", gap: 8,
  },
  noMessages: {
    color: "rgba(255,255,255,0.25)", fontSize: 13, textAlign: "center",
    marginTop: 20,
  },
  msgRow: (isMe) => ({
    display: "flex", flexDirection: "column",
    alignItems: isMe ? "flex-end" : "flex-start",
  }),
  msgSender: {
    fontSize: 11, color: "#38bd9c", marginBottom: 3, paddingLeft: 4,
  },
  msgBubble: (isMe) => ({
    maxWidth: "85%", padding: "8px 12px",
    borderRadius: isMe ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
    background: isMe ? "#38bd9c" : "rgba(255,255,255,0.08)",
    color: isMe ? "#000" : "#fff",
    fontSize: 13, lineHeight: 1.4,
  }),
  chatForm: {
    display: "flex", gap: 8, padding: "12px 14px",
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },
  chatInput: {
    flex: 1, padding: "8px 12px", borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff", fontSize: 13, outline: "none",
  },
  sendBtn: {
    padding: "8px 14px", borderRadius: 8, border: "none",
    background: "#38bd9c", color: "#000",
    fontWeight: 600, fontSize: 13, cursor: "pointer",
  },
};