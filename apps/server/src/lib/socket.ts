import { ably } from "@vesper/lib";

export async function sendPoke({ userId }: { userId: string }) {
  if (!userId) return;
  await ably.channels.get(`replicache:${userId}`).publish({ name: "poke" });
}