import Papa from "papaparse";
import { db } from "../db/sqlite";

/* ================= HELPERS ================= */

function msToTime(ms: number): string {
  const d = new Date(ms);
  return d.toISOString().substr(11, 8);
}

export async function importCsvToSQLite(
  csvText: string,
  sessionId: string,
  trimStartMs = 0,
  trimEndMs = Infinity,
  eventDraft?: {
    eventName: string;
    eventType: "match" | "training";
    eventDate: string;
    location?: string;
    field?: string;
    notes?: string;
  }
) {
  /* ================= NORMALIZE CSV ================= */

  const normalized = csvText
    .replace(/^\uFEFF/, "")
    .replace(/\r/g, "")
    .replace(/(\d)\n(?=\d+,)/g, "$1\n");

  const parsed = Papa.parse(normalized.trim(), {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length) {
    console.warn("❌ CSV PARSE ERRORS:", parsed.errors);
  }

  const rows = parsed.data as any[];
  if (!rows.length) {
    throw new Error("No rows after CSV parse");
  }

  /* ================= SESSION START ================= */

  const sessionStartMs = Number(rows[0].timestamp_ms);
  if (isNaN(sessionStartMs)) {
    throw new Error("Invalid timestamp_ms in CSV");
  }

  const absStart = sessionStartMs + trimStartMs;
  const absEnd = sessionStartMs + trimEndMs;

  console.log("🟢 TRIM WINDOW", msToTime(absStart), "→", msToTime(absEnd));

  /* ================= TRANSACTION ================= */

  let txStarted = false;

  try {
    await db.execute("BEGIN");
    txStarted = true;

    /* ===== SAVE EVENT / SESSION METADATA (THIS WAS MISSING) ===== */

    if (eventDraft) {
      await db.execute(
        `
        INSERT OR REPLACE INTO sessions (
          session_id,
          event_name,
          event_type,
          event_date,
          location,
          field,
          notes,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          sessionId,
          eventDraft.eventName,
          eventDraft.eventType,
          eventDraft.eventDate,
          eventDraft.location ?? null,
          eventDraft.field ?? null,
          eventDraft.notes ?? null,
          Date.now(),
        ]
      );

      console.log("✅ SESSION SAVED:", sessionId);
    }

    /* ===== CLEAR OLD RAW DATA ===== */

    await db.execute(
      `DELETE FROM raw_data WHERE session_id = ?`,
      [sessionId]
    );

    /* ===== INSERT RAW DATA ===== */

    let inserted = 0;

    for (const row of rows) {
      const timestamp = Number(row.timestamp_ms);
      if (!row.player_id || isNaN(timestamp)) continue;
      if (timestamp < absStart || timestamp > absEnd) continue;

      await db.execute(
        `
        INSERT INTO raw_data (
          session_id,
          player_id,
          timestamp_ms,
          acc_x, acc_y, acc_z,
          quat_w, quat_x, quat_y, quat_z,
          lat, lon,
          heartrate
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          sessionId,
          Number(row.player_id),
          timestamp,
          Number(row.acc_x),
          Number(row.acc_y),
          Number(row.acc_z),
          Number(row.quat_w),
          Number(row.quat_x),
          Number(row.quat_y),
          Number(row.quat_z),
          Number(row.lat),
          Number(row.lon),
          Number(row.heartrate),
        ]
      );

      inserted++;
    }

    await db.execute("COMMIT");

    console.log(`✅ RAW DATA INSERTED: ${inserted}`);
    const res = await db.execute(
      "SELECT * FROM sessions WHERE session_id = ?",
      [sessionId]
    );

    console.log("📋 SESSION ROW:", res.rows._array);

  } catch (err) {
    if (txStarted) {
      await db.execute("ROLLBACK");
    }
    console.error("❌ CSV IMPORT FAILED", err);
    throw err;
  }
}
