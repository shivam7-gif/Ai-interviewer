import { useEffect, useRef, useState } from "react";
import { Video, VideoOff } from "lucide-react";

type CameraStatus = "loading" | "live" | "denied" | "error";

interface UserCameraProps {
  label?: string;
}

export function UserCamera({ label = "You" }: UserCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<CameraStatus>("loading");

  useEffect(() => {
    let stream: MediaStream | null = null;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((mediaStream) => {
        stream = mediaStream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = mediaStream;
          void video.play().catch(() => {});
        }
        setStatus("live");
      })
      .catch(() => setStatus("denied"));

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <div className="shrink-0 border-t border-neutral-800 bg-neutral-950">
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-[11px] font-medium uppercase tracking-widest text-neutral-500">
          {label}
        </span>
        <span
          className={`flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide ${
            status === "live" ? "text-emerald-400" : "text-neutral-500"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              status === "live" ? "bg-emerald-400 animate-pulse" : "bg-neutral-600"
            }`}
          />
          {status === "live" ? "Live" : status === "loading" ? "Starting" : "Off"}
        </span>
      </div>

      <div className="relative mx-3 mb-3 aspect-video overflow-hidden rounded-md border border-neutral-800 bg-neutral-900">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`h-full w-full -scale-x-100 object-cover ${status === "live" ? "block" : "hidden"}`}
        />

        {status !== "live" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-neutral-500">
            {status === "loading" ? (
              <>
                <Video size={20} className="animate-pulse" />
                <span className="text-xs">Starting camera…</span>
              </>
            ) : (
              <>
                <VideoOff size={20} />
                <span className="px-4 text-center text-xs leading-relaxed">
                  Camera access denied. Allow camera permission to appear on video.
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
