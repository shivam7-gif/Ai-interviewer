import React, { useRef, useEffect } from "react";
import { AIAvatar } from "./AIAvatar";
import { VoiceStatus } from "./VoiceStatus";
import { WebcamCard } from "./WebcamCard";
import { useVoiceStatus, useChatMessages, useCamera } from "../hooks";

interface LeftPanelProps {
  projectId: string;
  userName?: string;
  userAvatar?: string;
  camera?: ReturnType<typeof useCamera>;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  projectId,
  userName = "You",
  camera,
}) => {
  const voiceState = useVoiceStatus();
  const { messages } = useChatMessages(projectId);
  const internalCamera = useCamera();
  const cam = camera ?? internalCamera;
  const { attachVideo, status, micMuted, setMicMuted, camOff, toggleCam } = cam;
  const captionsBottomRef = useRef<HTMLDivElement>(null);

  // Take the last 3 lines of the transcript
  const recentMessages = messages.slice(-3);

  useEffect(() => {
    captionsBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [recentMessages]);

  const isSpeaking = voiceState === "speaking";

  return (
    <div className="left-panel">
      {/* ── Top section — AI Interviewer & Live Captions ────────── */}
      <div className="interviewer-section">
        {/* Flat audio indicator */}
        <div className="interviewer-avatar-area">
          <AIAvatar speaking={isSpeaking} />
        </div>

        {/* Status line & LIVE badge */}
        <VoiceStatus state={voiceState} />

        {/* Live captions (last 3 lines of transcript) */}
        <div className="captions-area" aria-live="polite">
          <div className="captions-list">
            {recentMessages.length > 0 ? (
              recentMessages.map((msg) => {
                const isAi = msg.role === "ai";
                const speakerLabel = isAi ? "Alex" : "You";
                return (
                  <div
                    key={msg.id}
                    className={`caption-line ${isAi ? "caption-ai" : "caption-user"}`}
                  >
                    <span className="caption-speaker">{speakerLabel}:</span>
                    <span className="caption-text">{msg.text}</span>
                  </div>
                );
              })
            ) : null}
            <div ref={captionsBottomRef} />
          </div>
        </div>
      </div>

      {/* ── Bottom section — Candidate tile ────────────────────── */}
      <div className="candidate-section">
        <WebcamCard
          videoRef={attachVideo}
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
