import { useEffect, useState } from "react";
import { Room, RoomEvent } from "livekit-client";
import { BACKEND_URL } from "../../config/lib/config";

interface Props {
  projectId: string;
  user: {
    sub: string;
  };
}

const LiveKitRoom = ({ projectId, user }: Props) => {
  const identity = user?.sub;

  const [status, setStatus] = useState<
    "connecting" | "connected" | "permission" | "error"
  >("connecting");

  const [room, setRoom] = useState<Room | null>(null);

  console.log("ProjectId:", projectId);
  console.log("User:", user);
  console.log("Identity:", identity);

  useEffect(() => {
    if (!projectId || !identity) {
      console.error("Missing projectId or identity");
      return;
    }

    const localRoom = new Room();

    const connect = async () => {
      try {
        setStatus("connecting");

        const response = await fetch(`${BACKEND_URL}/api/livekit/token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomName: projectId,
            identity,
          }),
        });

        if (!response.ok) {
          const text = await response.text().catch(() => "");
          console.error(text);
          throw new Error("Failed to generate token");
        }

        const { token, serverUrl } = await response.json();

        // ---------- Events ----------

        localRoom.on(RoomEvent.Connected, () => {
          console.log(" Connected to LiveKit");
        });

        localRoom.on(RoomEvent.Reconnecting, () => {
          console.log(" Reconnecting...");
        });

        localRoom.on(RoomEvent.Reconnected, () => {
          console.log(" Reconnected");
        });

        localRoom.on(RoomEvent.Disconnected, (reason) => {
          console.log("Disconnected", reason);
        });

        localRoom.on(RoomEvent.ParticipantConnected, (participant) => {
          console.log(" Participant joined:", participant.identity);
        });

        localRoom.on(RoomEvent.ParticipantDisconnected, (participant) => {
          console.log(" Participant left:", participant.identity);
        });

        localRoom.on(RoomEvent.LocalTrackPublished, (publication) => {
          console.log(" Local Track Published:", publication.kind);
        });

        localRoom.on(
          RoomEvent.TrackSubscribed,
          (_track, _publication, participant) => {
            console.log(" Remote Track from:", participant.identity);
          }
        );

        // ---------- Connect ----------

        await localRoom.connect(serverUrl, token);

        console.log("Connected to room");

        // ---------- Ask Mic Permission ----------

        try {
          await navigator.mediaDevices.getUserMedia({
            audio: true,
          });

          await localRoom.localParticipant.setMicrophoneEnabled(true);

          console.log(" Microphone Enabled");

          setStatus("connected");
        } catch (err) {
          console.error("Microphone permission denied", err);

          setStatus("permission");
        }

        setRoom(localRoom);
      } catch (err) {
        console.error("LiveKit Error:", err);
        setStatus("error");
      }
    };

    connect();

    return () => {
      console.log("Disconnecting LiveKit...");
      localRoom.disconnect();
    };
  }, [projectId, identity]);

  return (
    <div style={{ padding: 10 }}>
      <div>
        <strong>LiveKit Status</strong>
      </div>

      {status === "connecting" && <div> Connecting...</div>}

      {status === "connected" && <div> Connected</div>}

      {status === "permission" && (
        <div>Please allow microphone access and refresh the page.</div>
      )}

      {status === "error" && <div> Failed to connect.</div>}
    </div>
  );
};

export default LiveKitRoom;
