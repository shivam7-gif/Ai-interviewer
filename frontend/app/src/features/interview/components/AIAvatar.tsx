import React from "react";

interface AIAvatarProps {
  speaking?: boolean;
}

export const AIAvatar: React.FC<AIAvatarProps> = ({ speaking = false }) => {
  return (
    <div
      className="audio-indicator"
      aria-label={speaking ? "Interviewer speaking" : "Interviewer listening"}
      role="status"
    >
      <span className={`audio-bar bar-1 ${speaking ? "speaking" : ""}`} />
      <span className={`audio-bar bar-2 ${speaking ? "speaking" : ""}`} />
      <span className={`audio-bar bar-3 ${speaking ? "speaking" : ""}`} />
      <span className={`audio-bar bar-4 ${speaking ? "speaking" : ""}`} />
      <span className={`audio-bar bar-5 ${speaking ? "speaking" : ""}`} />
    </div>
  );
};
