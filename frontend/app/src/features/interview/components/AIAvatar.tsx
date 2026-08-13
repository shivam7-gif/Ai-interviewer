import React from "react";

interface AIAvatarProps {
  speaking?: boolean;
}

export const AIAvatar: React.FC<AIAvatarProps> = ({ speaking = false }) => {
  return (
    <div className="ai-avatar-container" style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", minHeight: "160px" }}>
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "28px",
          boxShadow: speaking ? "0 0 24px rgba(139, 92, 246, 0.6)" : "0 4px 12px rgba(0, 0, 0, 0.4)",
          transition: "box-shadow 0.3s ease",
        }}
      >
        🎙️
      </div>
      {speaking && (
        <div
          style={{
            position: "absolute",
            width: 100,
            height: 100,
            borderRadius: "50%",
            border: "2px solid rgba(139, 92, 246, 0.4)",
            animation: "pulse 1.5s infinite ease-out",
          }}
        />
      )}
    </div>
  );
};
