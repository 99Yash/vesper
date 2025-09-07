import { ably } from "@vesper/lib";

export async function sendPoke({ userId }: { userId: string }) {
  ably.channels.get(`replicache:${userId}`).publish({});
}