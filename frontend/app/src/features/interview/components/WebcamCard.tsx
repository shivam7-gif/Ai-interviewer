import React from "react";
import { Mic, MicOff, Video, VideoOff, Wifi, WifiOff } from "lucide-react";

interface WebcamCardProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
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
    <div className="webcam-card">
      {/* Header row */}
      <div className="webcam-header">
        <div className="webcam-label">
          <span className="webcam-label-text">{label}</span>
        </div>
        <div
          className={`webcam-status ${isLive ? "webcam-status-live" : "webcam-status-off"}`}
        >
          {isLive ? <Wifi size={11} /> : <WifiOff size={11} />}
          <span>{isLive ? "Connected" : status === "loading" ? "Starting" : "No Camera"}</span>
        </div>
      </div>

      {/* Video preview */}
      <div className="webcam-preview">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`webcam-video ${!camOff && isLive ? "webcam-video-visible" : "webcam-video-hidden"}`}
          style={{ transform: "scaleX(-1)" }}
        />

        {/* Overlay when camera is off or loading */}
        {(camOff || !isLive) && (
          <div className="webcam-overlay">
            <div className="webcam-avatar-placeholder">
              {label[0]?.toUpperCase() ?? "U"}
            </div>
            {status === "denied" && (
              <span className="webcam-denied-text">Camera access denied</span>
            )}
          </div>
        )}

        {/* Control buttons overlay */}
        <div className="webcam-controls">
          <button
            onClick={onToggleMic}
            className={`webcam-ctrl-btn ${micMuted ? "webcam-ctrl-danger" : ""}`}
            title={micMuted ? "Unmute" : "Mute"}
          >
            {micMuted ? <MicOff size={14} /> : <Mic size={14} />}
          </button>
          <button
            onClick={onToggleCam}
            className={`webcam-ctrl-btn ${camOff ? "webcam-ctrl-danger" : ""}`}
            title={camOff ? "Enable camera" : "Disable camera"}
          >
            {camOff ? <VideoOff size={14} /> : <Video size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
};
