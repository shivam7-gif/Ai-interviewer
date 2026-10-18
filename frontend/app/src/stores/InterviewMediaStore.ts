import { create } from "zustand";

interface InterviewMediaState {
  stream: MediaStream | null;
  checkedSessionId: string | null;
  selectedVideoDeviceId: string;
  selectedAudioDeviceId: string;
  setStream: (stream: MediaStream | null, sessionId: string) => void;
  setSelectedDevices: (videoDeviceId: string, audioDeviceId: string) => void;
  markChecked: (sessionId: string) => void;
  isSessionChecked: (sessionId: string) => boolean;
  clearStream: () => void;
}

export const useInterviewMediaStore = create<InterviewMediaState>()((set, get) => ({
  stream: null,
  checkedSessionId: null,
  selectedVideoDeviceId: "",
  selectedAudioDeviceId: "",

  setStream: (stream, sessionId) => {
    set({ stream, checkedSessionId: sessionId });
    if (stream) {
      sessionStorage.setItem(`interview_checked_${sessionId}`, "true");
    }
  },

  setSelectedDevices: (videoDeviceId, audioDeviceId) => {
    set({ selectedVideoDeviceId: videoDeviceId, selectedAudioDeviceId: audioDeviceId });
  },

  markChecked: (sessionId) => {
    set({ checkedSessionId: sessionId });
    sessionStorage.setItem(`interview_checked_${sessionId}`, "true");
  },

  isSessionChecked: (sessionId) => {
    const { stream, checkedSessionId } = get();
    const sessionFlag = sessionStorage.getItem(`interview_checked_${sessionId}`);

    // UX guard: must have active stream in memory matching this session and session flag
    if (!stream || checkedSessionId !== sessionId || sessionFlag !== "true") {
      return false;
    }

    // Verify tracks are still live
    const videoLive = stream.getVideoTracks().some((t) => t.readyState === "live");
    const audioLive = stream.getAudioTracks().some((t) => t.readyState === "live");

    return videoLive && audioLive;
  },

  clearStream: () => {
    const { stream } = get();
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    set({ stream: null, checkedSessionId: null });
  },
}));
