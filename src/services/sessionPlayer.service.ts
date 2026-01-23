import { db } from "../db/sqlite";

/* =====================================================
   SESSION PLAYERS (ASSIGN / UNASSIGN)
   ===================================================== */

export const saveSessionPlayers = (
  sessionId: string,
  assignedMap: Record<string, boolean>
) => {
  try {
    db.execute(
      `DELETE FROM session_players WHERE session_id = ?`,
      [sessionId]
    );

    Object.entries(assignedMap).forEach(([playerId, assigned]) => {
      db.execute(
        `
        INSERT INTO session_players (
          session_id,
          player_id,
          assigned
        )
        VALUES (?, ?, ?)
        `,
        [sessionId, playerId, assigned ? 1 : 0]
      );
    });

    console.log("✅ Session players saved");
  } catch (err) {
    console.error("❌ Failed to save session players", err);
  }
};

/* =====================================================
   SESSION POD OVERRIDES (SWAP / DISABLE)
   ===================================================== */

export const saveSessionPodOverrides = (
  sessionId: string,
  podMap: Record<string, string | null>
) => {
  try {
    db.execute(
      `DELETE FROM session_pod_overrides WHERE session_id = ?`,
      [sessionId]
    );

    Object.entries(podMap).forEach(([podSerial, playerId]) => {
      db.execute(
        `
        INSERT INTO session_pod_overrides (
          session_id,
          pod_serial,
          player_id
        )
        VALUES (?, ?, ?)
        `,
        [sessionId, podSerial, playerId]
      );
    });

    console.log("✅ Session pod overrides saved");
  } catch (err) {
    console.error("❌ Failed to save pod overrides", err);
  }
};

/* =====================================================
   READ: PLAYERS + ASSIGNMENT + POD OVERRIDES
   ===================================================== */

export const getAssignedPlayersForSession = (sessionId: string) => {
  try {
    /* =============================
       1️⃣ Load players + assignment
       ============================= */

    const playersRes = db.execute(
      `
      SELECT
        p.player_id,
        p.player_name,
        p.jersey_number,
        p.position,
        p.pod_serial AS default_pod_serial,
        sp.assigned
      FROM session_players sp
      JOIN players p ON p.player_id = sp.player_id
      WHERE sp.session_id = ?
      ORDER BY p.jersey_number ASC
      `,
      [sessionId]
    );

    const players = playersRes?.rows?._array ?? [];

    /* =============================
       2️⃣ Load pod overrides
       ============================= */

    const overridesRes = db.execute(
      `
      SELECT pod_serial, player_id
      FROM session_pod_overrides
      WHERE session_id = ?
      `,
      [sessionId]
    );

    const podToPlayer: Record<string, string | null> = {};
    (overridesRes?.rows?._array ?? []).forEach(r => {
      podToPlayer[r.pod_serial] = r.player_id; // null = disabled
    });

    /* =============================
       3️⃣ Build player → effective pod
       ============================= */

    const playerToPod: Record<string, string | null> = {};

    Object.entries(podToPlayer).forEach(([podSerial, playerId]) => {
      if (playerId) {
        playerToPod[playerId] = podSerial;
      }
    });

    /* =============================
       4️⃣ Final normalized output
       ============================= */

    return players.map(p => {
      const effectivePod =
        playerToPod[p.player_id] ??
        p.default_pod_serial ??
        null;

      const swapped =
        effectivePod !== null &&
        effectivePod !== p.default_pod_serial;

      return {
        ...p,
        assigned: !!p.assigned,
        effective_pod_serial: effectivePod,
        swapped,
        pod_disabled: effectivePod === null,
      };
    });

  } catch (err) {
    console.error("❌ Failed to read session players", err);
    return [];
  }
};

/* =====================================================
   READ: POD OVERRIDES (USED DURING IMPORT)
   ===================================================== */

export const getSessionPodOverrides = (sessionId: string) => {
  try {
    const res = db.execute(
      `
      SELECT pod_serial, player_id
      FROM session_pod_overrides
      WHERE session_id = ?
      `,
      [sessionId]
    );

    const map: Record<string, string | null> = {};
    (res?.rows?._array ?? []).forEach(r => {
      map[r.pod_serial] = r.player_id; // null = disabled
    });

    return map;
  } catch (err) {
    console.error("❌ Failed to read pod overrides", err);
    return {};
  }
};
