import LiveKit from "./LiveKitRoom";

interface AIInterviewerProps {
  projectId: string;
  user: {
    sub: string;
    name?: string;
  } | null;
}

export function AIInterviewer({ projectId, user }: AIInterviewerProps) {
  if (!user) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 text-sm text-neutral-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-neutral-800 px-3 py-2">
        <span className="text-[11px] font-medium uppercase tracking-widest text-neutral-500">
          AI Interviewer
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        <LiveKit projectId={projectId} user={user} />

        <div className="mt-4 space-y-3">
          <p className="text-xs leading-relaxed text-neutral-400">
            Transcript will appear here as the interview progresses.
          </p>
        </div>
      </div>
    </div>
  );
}
