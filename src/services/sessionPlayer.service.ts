import { db } from "../db/sqlite";

export const saveSessionPlayers = (
  sessionId: string,
  assignedMap: Record<string, boolean>
) => {
  db.execute("DELETE FROM session_players WHERE session_id = ?", [sessionId]);

  Object.entries(assignedMap).forEach(([playerId, assigned]) => {
    db.execute(
      `
      INSERT INTO session_players (session_id, player_id, assigned)
      VALUES (?, ?, ?)
      `,
      [sessionId, playerId, assigned ? 1 : 0]
    );
  });
};

export const getAssignedPlayersForSession = (sessionId: string) => {
  const res = db.execute(
    `
    SELECT
      p.player_id,
      p.player_name,
      p.jersey_number,
      p.position,
      p.pod_serial,
      p.pod_holder_serial,
      sp.assigned
    FROM session_players sp
    JOIN players p ON p.player_id = sp.player_id
    WHERE sp.session_id = ?
    ORDER BY p.jersey_number ASC
    `,
    [sessionId]
  );

  return res?.rows?._array ?? [];
};
