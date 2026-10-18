import React from "react";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";

interface WebcamCardProps {
  videoRef: React.Ref<HTMLVideoElement>;
  status: "loading" | "live" | "denied";
  label?: string;
  micMuted: boolean;
  camOff: boolean;
  onToggleMic: () => void;
  onToggleCam: () => void;
}

export const WebcamCard: React.FC<WebcamCardProps> = ({
  videoRef,
  status,
  label = "You",
  micMuted,
  camOff,
  onToggleMic,
  onToggleCam,
}) => {
  const isLive = status === "live";

  return (
    <div className="candidate-tile">
      {/* Tile header: Name + status */}
      <div className="candidate-header">
        <span className="candidate-name">{label}</span>
        <span className="candidate-status-text">
          {isLive && !camOff ? "Camera on" : status === "denied" ? "Denied" : "Camera off"}
        </span>
      </div>

      {/* Video display area */}
      <div className="candidate-video-area">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`candidate-video ${!camOff && isLive ? "video-visible" : "video-hidden"}`}
        />

        {/* Fallback when camera is disabled or not granted */}
        {(camOff || !isLive) && (
          <div className="candidate-fallback">
            <div className="candidate-avatar">
              {(label[0] ?? "U").toUpperCase()}
            </div>
            {status === "denied" && (
              <span className="candidate-denied">Camera permission denied</span>
            )}
          </div>
        )}

        {/* 32px Ghost icon control buttons with clear strikethrough icon state */}
        <div className="candidate-controls">
          <button
            onClick={onToggleMic}
            className={`ghost-ctrl-btn ${micMuted ? "ctrl-off" : "ctrl-on"}`}
            aria-label={micMuted ? "Unmute microphone" : "Mute microphone"}
            title={micMuted ? "Unmute microphone" : "Mute microphone"}
          >
            {micMuted ? <MicOff size={15} /> : <Mic size={15} />}
          </button>
          <button
            onClick={onToggleCam}
            className={`ghost-ctrl-btn ${camOff ? "ctrl-off" : "ctrl-on"}`}
            aria-label={camOff ? "Turn on camera" : "Turn off camera"}
            title={camOff ? "Turn on camera" : "Turn off camera"}
          >
            {camOff ? <VideoOff size={15} /> : <Video size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
};
