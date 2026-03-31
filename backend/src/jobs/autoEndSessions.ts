import { autoEndExpiredSessions } from "../services/session.service";
import { getIO } from "../socket";

/**
 * Runs every 15 seconds.
 * Finds sessions whose endTime has passed, marks them COMPLETED,
 * sets devices back to AVAILABLE, and notifies all clients via Socket.io.
 */
export function startAutoEndJob(): NodeJS.Timeout {
  const interval = setInterval(async () => {
    try {
      const ended = await autoEndExpiredSessions();
      if (ended.length === 0) return;

      const io = getIO();
      for (const { sessionId, deviceId } of ended) {
        io.emit("sessionEnded", { sessionId, deviceId });
      }
      io.emit("devicesUpdated");

      console.log(
        `[job] Auto-ended ${ended.length} session(s): ${ended.map((e) => e.sessionId).join(", ")}`,
      );
    } catch (err) {
      console.error("[job] autoEndSessions error:", err);
    }
  }, 15_000);

  return interval;
}
