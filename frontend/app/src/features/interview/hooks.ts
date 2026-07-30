import { useEffect, useRef, useState, useCallback } from "react";
import type { VoiceState } from "../types";

const AI_MESSAGES = [
  "Hello! I'm Sarah, your AI interviewer for today. Let's start with the \"Breakfast\" problem — a classic topological sort question. Are you familiar with topological sort?",
  "Great approach! Using a min-heap ensures we always pick the smallest numbered node when there are multiple choices. Can you walk me through the time complexity of your solution?",
  "Exactly right — O((N + M) log N) due to the priority queue operations. Now, what edge cases should we consider?",
  "Spot on. A cycle in the graph makes a valid ordering impossible. Kahn's algorithm detects this when the result has fewer elements than N. Let's code it up!",
];

export function useVoiceStatus() {
  const [voiceState, setVoiceState] = useState<VoiceState>("listening");

  useEffect(() => {
    const states: VoiceState[] = ["listening", "thinking", "speaking", "listening"];
    let idx = 0;
    const intervals = [3000, 2000, 4000, 3000];

    let timer: ReturnType<typeof setTimeout>;
    function cycle() {
      idx = (idx + 1) % states.length;
      setVoiceState(states[idx]);
      timer = setTimeout(cycle, intervals[idx]);
    }
    timer = setTimeout(cycle, intervals[idx]);
    return () => clearTimeout(timer);
  }, []);

  return voiceState;
}

export function useChatMessages() {
  const [messages, setMessages] = useState([
    { id: "1", role: "ai" as const, text: AI_MESSAGES[0], timestamp: new Date(Date.now() - 120000) },
    { id: "2", role: "user" as const, text: "Yes, I think we can use a min-heap to get the lexicographically smallest topological order.", timestamp: new Date(Date.now() - 90000) },
    { id: "3", role: "ai" as const, text: AI_MESSAGES[1], timestamp: new Date(Date.now() - 60000) },
    { id: "4", role: "user" as const, text: "It should be O((N + M) log N) because each push/pop into the priority queue takes log N time and we do it for every node and edge.", timestamp: new Date(Date.now() - 30000) },
  ]);

  const addMessage = useCallback((role: "ai" | "user", text: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), role, text, timestamp: new Date() }]);
  }, []);

  return { messages, addMessage };
}

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<"loading" | "live" | "denied">("loading");
  const [micMuted, setMicMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play().catch(() => {});
        }
        setStatus("live");
      })
      .catch(() => setStatus("denied"));

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const toggleCam = useCallback(() => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = camOff;
      setCamOff((v) => !v);
    }
  }, [camOff]);

  return { videoRef, status, micMuted, setMicMuted, camOff, toggleCam };
}

export function useEditorAutoSave(code: string) {
  const key = "interviewos_editor_code";

  useEffect(() => {
    const saved = localStorage.getItem(key);
    if (saved) return; // don't override if we already stored
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(key, code);
    }, 1000);
    return () => clearTimeout(timer);
  }, [code]);

  const getSaved = useCallback(() => localStorage.getItem(key), []);
  return { getSaved };
}

export function usePanelSizes() {
  const key = "interviewos_panel_sizes";
  const defaultSizes = [22, 50, 28];

  const getSizes = (): number[] => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch {}
    return defaultSizes;
  };

  const saveSizes = (sizes: number[]) => {
    localStorage.setItem(key, JSON.stringify(sizes));
  };

  return { getSizes, saveSizes };
}
