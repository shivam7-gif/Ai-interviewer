import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Camera, Volume2, ArrowRight } from "lucide-react";
import { useInterviewMediaStore } from "../../../stores/InterviewMediaStore";
import "../deviceCheck.css";

type DeviceStatus =
  | "not_requested"
  | "waiting"
  | "working"
  | "blocked"
  | "not_found"
  | "in_use";

const STATUS_LABELS: Record<DeviceStatus, string> = {
  not_requested: "Not requested",
  waiting: "Waiting for permission",
  working: "Working",
  blocked: "Blocked",
  not_found: "No device found",
  in_use: "In use by another app",
};

export const DeviceCheckPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { setStream, setSelectedDevices, markChecked } = useInterviewMediaStore();

  const [cameraStatus, setCameraStatus] = useState<DeviceStatus>("not_requested");
  const [microphoneStatus, setMicrophoneStatus] = useState<DeviceStatus>("not_requested");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<string>("");
  const [selectedAudioId, setSelectedAudioId] = useState<string>("");

  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [hasSpoken, setHasSpoken] = useState<boolean>(false);

  const [hasPlayedSound, setHasPlayedSound] = useState<boolean>(false);
  const [speakerFeedback, setSpeakerFeedback] = useState<"yes" | "no" | null>(null);
  const [announcement, setAnnouncement] = useState<string>("");

  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isJoiningRef = useRef<boolean>(false);

  // Announce status changes to assistive technologies
  const announce = (msg: string) => {
    setAnnouncement(msg);
  };

  // Browser detection for instructions
  const getBrowserInstruction = () => {
    const ua = navigator.userAgent;
    if (ua.includes("Firefox")) {
      return "Click the camera and microphone icon in the address bar, clear the blocked permission, then press Re-check.";
    }
    if (ua.includes("Safari") && !ua.includes("Chrome")) {
      return "Go to Safari > Settings for This Website, set Camera and Microphone to Allow, then press Re-check.";
    }
    return "Click the lock or site settings icon in the address bar, set Camera and Microphone to Allow, then press Re-check.";
  };

  // Stop any active Web Audio setup
  const stopAudioAnalyser = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  }, []);

  // Stop media tracks
  const stopTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }
    stopAudioAnalyser();
  }, [stopAudioAnalyser]);

  // Connect Web Audio AnalyserNode to the microphone track
  const setupAudioMeter = useCallback((stream: MediaStream) => {
    try {
      const audioTrack = stream.getAudioTracks()[0];
      if (!audioTrack) return;

      stopAudioAnalyser();

      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.4;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));

        setAudioLevel(normalized);

        // A mic counts as Working only after crossing the small threshold
        if (normalized >= 8) {
          setHasSpoken((prev) => {
            if (!prev) {
              setMicrophoneStatus("working");
              announce("Microphone working");
              return true;
            }
            return prev;
          });
        }

        animFrameRef.current = requestAnimationFrame(updateMeter);
      };

      animFrameRef.current = requestAnimationFrame(updateMeter);
    } catch (err) {
      console.error("Audio analyser initialization error:", err);
    }
  }, [stopAudioAnalyser]);

  // Request or re-acquire user media
  const requestMedia = useCallback(
    async (targetVideoId?: string, targetAudioId?: string) => {
      // Insecure context check
      if (window.isSecureContext === false) {
        setCameraStatus("blocked");
        setMicrophoneStatus("blocked");
        setErrorMessage(
          "Device access requires a secure connection (HTTPS or localhost). Please access this site over HTTPS."
        );
        return;
      }

      // Browser support check
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraStatus("blocked");
        setMicrophoneStatus("blocked");
        setErrorMessage(
          "Your browser does not support camera or microphone access. Please use a current version of Chrome, Edge, Firefox, or Safari."
        );
        return;
      }

      setCameraStatus("waiting");
      setMicrophoneStatus("waiting");
      setErrorMessage(null);
      announce("Waiting for camera and microphone permission");

      // Stop previous stream if restarting with a different device
      stopTracks();

      try {
        const constraints: MediaStreamConstraints = {
          video: targetVideoId
            ? { deviceId: { exact: targetVideoId }, width: { ideal: 1280 }, height: { ideal: 720 } }
            : { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: targetAudioId
            ? { deviceId: { exact: targetAudioId } }
            : true,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        // Attach video preview
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
          void videoPreviewRef.current.play().catch(() => {});
        }

        const videoTrack = stream.getVideoTracks()[0];
        const audioTrack = stream.getAudioTracks()[0];

        // Track ended listeners (unplug or permission revoke)
        if (videoTrack) {
          videoTrack.onended = () => {
            setCameraStatus("not_found");
            announce("Camera disconnected");
          };
          setCameraStatus("working");
          announce("Camera working");
        } else {
          setCameraStatus("not_found");
        }

        if (audioTrack) {
          audioTrack.onended = () => {
            setMicrophoneStatus("not_found");
            setHasSpoken(false);
            announce("Microphone disconnected");
          };
          // Connect Web Audio meter
          setupAudioMeter(stream);
        } else {
          setMicrophoneStatus("not_found");
        }

        // Enumerate devices now that labels are accessible
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const vDevs = devices.filter((d) => d.kind === "videoinput");
          const aDevs = devices.filter((d) => d.kind === "audioinput");

          setVideoDevices(vDevs);
          setAudioDevices(aDevs);

          const activeVideoDevice = videoTrack?.getSettings()?.deviceId;
          const activeAudioDevice = audioTrack?.getSettings()?.deviceId;

          if (activeVideoDevice) setSelectedVideoId(activeVideoDevice);
          else if (vDevs[0]) setSelectedVideoId(vDevs[0].deviceId);

          if (activeAudioDevice) setSelectedAudioId(activeAudioDevice);
          else if (aDevs[0]) setSelectedAudioId(aDevs[0].deviceId);
        } catch {}
      } catch (err: unknown) {
        const error = err as { name?: string; message?: string };
        console.error("getUserMedia error:", error);

        if (
          error.name === "NotAllowedError" ||
          error.name === "PermissionDeniedError" ||
          error.name === "SecurityError"
        ) {
          setCameraStatus("blocked");
          setMicrophoneStatus("blocked");
          setErrorMessage(getBrowserInstruction());
          announce("Camera and microphone permission blocked");
        } else if (
          error.name === "NotFoundError" ||
          error.name === "DevicesNotFoundError"
        ) {
          setCameraStatus("not_found");
          setMicrophoneStatus("not_found");
          setErrorMessage("No camera or microphone was found. Connect one and press Re-check.");
          announce("No camera or microphone found");
        } else if (
          error.name === "NotReadableError" ||
          error.name === "TrackStartError"
        ) {
          setCameraStatus("in_use");
          setMicrophoneStatus("in_use");
          setErrorMessage("Another app is using your camera or microphone. Close it and press Re-check.");
          announce("Device is in use by another app");
        } else {
          setCameraStatus("blocked");
          setMicrophoneStatus("blocked");
          setErrorMessage(getBrowserInstruction());
          announce("Unable to access camera or microphone");
        }
      }
    },
    [stopTracks, setupAudioMeter]
  );

  // Subscribe to Permissions API changes
  useEffect(() => {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions
          .query({ name: "camera" as PermissionName })
          .then((p) => {
            p.onchange = () => {
              if (p.state === "granted") {
                void requestMedia(selectedVideoId, selectedAudioId);
              }
            };
          })
          .catch(() => {});

        navigator.permissions
          .query({ name: "microphone" as PermissionName })
          .then((p) => {
            p.onchange = () => {
              if (p.state === "granted") {
                void requestMedia(selectedVideoId, selectedAudioId);
              }
            };
          })
          .catch(() => {});
      }
    } catch {}
  }, [requestMedia, selectedVideoId, selectedAudioId]);

  // Listen for device changes (plug/unplug)
  useEffect(() => {
    const handleDeviceChange = () => {
      if (cameraStatus === "working" || microphoneStatus === "working") {
        void requestMedia(selectedVideoId, selectedAudioId);
      }
    };

    navigator.mediaDevices?.addEventListener("devicechange", handleDeviceChange);
    return () => {
      navigator.mediaDevices?.removeEventListener("devicechange", handleDeviceChange);
    };
  }, [cameraStatus, microphoneStatus, requestMedia, selectedVideoId, selectedAudioId]);

  // Cleanup on unmount: stop tracks if user leaves without joining
  useEffect(() => {
    return () => {
      if (!isJoiningRef.current) {
        stopTracks();
      }
    };
  }, [stopTracks]);

  // Switch camera device
  const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedVideoId(newId);
    void requestMedia(newId, selectedAudioId);
  };

  // Switch microphone device
  const handleMicrophoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedAudioId(newId);
    setHasSpoken(false);
    void requestMedia(selectedVideoId, newId);
  };

  // Speaker test sound: plays short clean sine tone chime using Web Audio API
  const playTestSound = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.45);

      setHasPlayedSound(true);
      setSpeakerFeedback(null);
      announce("Playing speaker test sound");

      setTimeout(() => {
        ctx.close().catch(() => {});
      }, 500);
    } catch (err) {
      console.error("Speaker test sound error:", err);
    }
  };

  // Both camera and mic must be working to join
  const canJoin = cameraStatus === "working" && microphoneStatus === "working";

  // Compute disabled hint
  const getDisabledHint = () => {
    if (cameraStatus !== "working" && microphoneStatus !== "working") {
      return "Enable your camera and microphone to continue.";
    }
    if (cameraStatus !== "working") {
      return "Enable your camera to continue.";
    }
    if (microphoneStatus !== "working" && !hasSpoken) {
      return "Say something to test your microphone.";
    }
    if (microphoneStatus !== "working") {
      return "Enable your microphone to continue.";
    }
    return "";
  };

  // Join interview
  const handleJoin = () => {
    if (!canJoin || !projectId) return;

    isJoiningRef.current = true;
    stopAudioAnalyser();

    if (streamRef.current) {
      setStream(streamRef.current, projectId);
      setSelectedDevices(selectedVideoId, selectedAudioId);
      markChecked(projectId);
    }

    navigate(`/project/${projectId}`);
  };

  // Back to dashboard
  const handleBackToDashboard = () => {
    isJoiningRef.current = false;
    stopTracks();
    navigate("/dashboard");
  };

  const getStatusDotClass = (status: DeviceStatus) => {
    if (status === "working") return "dot-working";
    if (status === "waiting") return "dot-waiting";
    if (status === "not_requested") return "dot-not-requested";
    return "dot-error";
  };

  return (
    <div className="device-check-shell">
      {/* Screen reader announcement region */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      <header className="device-check-header-bar">
        <span className="device-check-session-code">
          session {projectId ? projectId.slice(0, 8) : "a3f9c1b2"}
        </span>
      </header>

      <main className="device-check-container">
        {/* Header */}
        <div className="device-check-title-block">
          <h1 className="device-check-title">Check your setup</h1>
          <p className="device-check-subtitle">
            The interview starts when you join. The timer does not run during this check.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="device-check-grid">
          {/* Left Column: Camera Preview */}
          <section className="preview-column" aria-label="Camera preview">
            <div className="camera-preview-box">
              <video
                ref={videoPreviewRef}
                autoPlay
                playsInline
                muted
                className={`camera-preview-video ${
                  cameraStatus !== "working" ? "hidden" : ""
                }`}
              />
              {cameraStatus !== "working" && (
                <div className="camera-preview-fallback">
                  <Camera size={24} aria-hidden="true" />
                  <span>
                    {cameraStatus === "waiting"
                      ? "Waiting for permission..."
                      : "Camera preview is shown in your browser."}
                  </span>
                </div>
              )}
            </div>

            {/* Camera device selector */}
            {videoDevices.length > 0 && (
              <div className="device-selector-group">
                <label htmlFor="camera-select" className="device-selector-label">
                  Camera
                </label>
                <select
                  id="camera-select"
                  className="device-select"
                  value={selectedVideoId}
                  onChange={handleCameraChange}
                  disabled={cameraStatus !== "working"}
                >
                  {videoDevices.map((dev, idx) => (
                    <option key={dev.deviceId || idx} value={dev.deviceId}>
                      {dev.label || `Camera ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </section>

          {/* Right Column: Checklist & Controls */}
          <section className="checklist-column" aria-label="Device checklist">
            <div className="checklist-items">
              {/* Row 1: Camera */}
              <div className="check-item">
                <div className="check-item-header">
                  <span className="check-item-name">Camera</span>
                  <div className="check-item-status">
                    <span
                      className={`check-status-dot ${getStatusDotClass(cameraStatus)}`}
                      aria-hidden="true"
                    />
                    <span>{STATUS_LABELS[cameraStatus]}</span>
                  </div>
                </div>
              </div>

              {/* Row 2: Microphone */}
              <div className="check-item">
                <div className="check-item-header">
                  <span className="check-item-name">Microphone</span>
                  <div className="check-item-status">
                    <span
                      className={`check-status-dot ${getStatusDotClass(microphoneStatus)}`}
                      aria-hidden="true"
                    />
                    <span>{STATUS_LABELS[microphoneStatus]}</span>
                  </div>
                </div>

                {/* Input Level Meter */}
                {streamRef.current && streamRef.current.getAudioTracks().length > 0 && (
                  <div className="audio-meter-group">
                    <div
                      className="audio-meter-track"
                      role="meter"
                      aria-label="Microphone input level"
                      aria-valuenow={audioLevel}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className="audio-meter-fill"
                        style={{ width: `${audioLevel}%` }}
                      />
                    </div>
                    {!hasSpoken ? (
                      <span className="audio-meter-hint">
                        Say something to test your microphone.
                      </span>
                    ) : (
                      <span className="audio-meter-tested">
                        Audio detected
                      </span>
                    )}
                  </div>
                )}

                {/* Microphone device selector */}
                {audioDevices.length > 0 && (
                  <div className="device-selector-group">
                    <label htmlFor="mic-select" className="device-selector-label">
                      Microphone
                    </label>
                    <select
                      id="mic-select"
                      className="device-select"
                      value={selectedAudioId}
                      onChange={handleMicrophoneChange}
                      disabled={microphoneStatus === "not_requested"}
                    >
                      {audioDevices.map((dev, idx) => (
                        <option key={dev.deviceId || idx} value={dev.deviceId}>
                          {dev.label || `Microphone ${idx + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Row 3: Speaker (Optional, does not block joining) */}
              <div className="check-item">
                <div className="check-item-header">
                  <span className="check-item-name">Speaker</span>
                  <span className="device-selector-label">Optional</span>
                </div>

                <div className="speaker-test-controls">
                  <button
                    type="button"
                    className="ghost-check-btn"
                    onClick={playTestSound}
                  >
                    <Volume2 size={13} aria-hidden="true" />
                    <span>Play test sound</span>
                  </button>

                  {hasPlayedSound && (
                    <div className="speaker-feedback-line">
                      <span>Did you hear it?</span>
                      <button
                        type="button"
                        className="ghost-check-btn"
                        onClick={() => setSpeakerFeedback("yes")}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        className="ghost-check-btn"
                        onClick={() => setSpeakerFeedback("no")}
                      >
                        No
                      </button>
                    </div>
                  )}
                </div>

                {speakerFeedback === "no" && (
                  <div className="speaker-tip-box" role="note">
                    Check your system audio output device or headphones.
                  </div>
                )}
              </div>
            </div>

            {/* Error or Instruction block */}
            {errorMessage && (
              <div className="instruction-box" role="alert">
                <p className="instruction-text">{errorMessage}</p>
                <button
                  type="button"
                  className="recheck-btn"
                  onClick={() => requestMedia(selectedVideoId, selectedAudioId)}
                >
                  Re-check
                </button>
              </div>
            )}

            {/* Checklist Action Area */}
            <div className="checklist-action-area">
              {/* First-step button: Request on click only */}
              {cameraStatus === "not_requested" &&
                microphoneStatus === "not_requested" && (
                  <button
                    type="button"
                    className="enable-permissions-btn"
                    onClick={() => requestMedia()}
                  >
                    Enable camera and microphone
                  </button>
                )}

              {/* Primary button: Join interview */}
              <button
                type="button"
                className="join-interview-btn"
                disabled={!canJoin}
                onClick={handleJoin}
              >
                <span>Join interview</span>
                <ArrowRight size={14} aria-hidden="true" />
              </button>

              {!canJoin && (
                <p className="join-disabled-hint">{getDisabledHint()}</p>
              )}

              {/* Secondary link: Back to dashboard */}
              <button
                type="button"
                className="back-dashboard-link"
                onClick={handleBackToDashboard}
              >
                Back to dashboard
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
