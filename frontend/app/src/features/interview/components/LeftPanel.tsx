import React, { useRef, useEffect } from "react";
import { AIAvatar } from "./AIAvatar";
import { ChatBubble } from "./ChatBubble";
import { VoiceStatus } from "./VoiceStatus";
import { WebcamCard } from "./WebcamCard";
import { useVoiceStatus, useChatMessages, useCamera } from "../hooks";

interface LeftPanelProps {
  projectId: string;
  userName?: string;
  userAvatar?: string;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  projectId: _,
  userName = "You",
}) => {
  const voiceState = useVoiceStatus();
  const { messages } = useChatMessages();
  const { videoRef, status, micMuted, setMicMuted, camOff, toggleCam } = useCamera();
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isSpeaking = voiceState === "speaking";

  return (
    <div className="left-panel">
      {/* ── Top 65% — AI Interviewer ─────────────────────────────── */}
      <div className="left-top">
        {/* Avatar section */}
        <div className="ai-section">
          <AIAvatar speaking={isSpeaking} />
        </div>

        {/* Chat transcript */}
        <div className="chat-area">
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
          <div ref={chatBottomRef} />
        </div>

        {/* Voice status */}
        <VoiceStatus state={voiceState} />
      </div>

      {/* ── Bottom 35% — Webcam ───────────────────────────────────── */}
      <div className="left-bottom">
        <WebcamCard
          videoRef={videoRef}
          status={status}
          label={userName}
          micMuted={micMuted}
          camOff={camOff}
          onToggleMic={() => setMicMuted((m) => !m)}
          onToggleCam={toggleCam}
        />
      </div>
    </div>
  );
};
