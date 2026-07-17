import { AccessToken } from "livekit-server-sdk";

interface TokenOptions {
  roomName: string;
  identity: string;
}

/**
 * Generates a signed LiveKit access token for a participant to join a room.
 */
export async function generateLiveKitToken(options: TokenOptions): Promise<string> {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error("LiveKit API credentials are not configured");
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity: options.identity,
    ttl: 3600, // 1 hour
  });

  at.addGrant({
    roomJoin: true,
    room: options.roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  return at.toJwt();
}
