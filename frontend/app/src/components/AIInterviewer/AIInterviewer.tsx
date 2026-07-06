import LiveKit from "../AIInterviewer/LiveKitRoom";

interface AIInterviewerProps {
  projectId: string;
  user: {
    id: string;
  } | null;
}
export function AIInterviewer({ projectId, user }: AIInterviewerProps) {
  if (!user) {
    return <div>Loading....</div>;
  }
  return (
    <div>
      <LiveKit projectId={projectId} user={user} />

      <div>AI Interviewer</div>

      {/* Transcript */}

      {/* Mic */}

      {/* Avatar */}
    </div>
  );
}
