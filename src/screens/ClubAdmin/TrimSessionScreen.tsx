import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  Dimensions,
  FlatList,
} from "react-native";
import { db } from "../../db/sqlite";
import { parseFileTimeRange } from "../../utils/parseFileTimeRange";
import { getAssignedPlayersForSession } from "../../services/sessionPlayer.service";

/* =====================================================
   HELPERS
===================================================== */

function formatTime(ms: number) {
  return new Date(ms).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

const HANDLE_GAP = 0.02;

/* =====================================================
   SCREEN
===================================================== */

export default function TrimSessionScreen({
  file,
  sessionId,
  eventDraft,
  goBack,
  goNext,
}: any) {
  const parsed = parseFileTimeRange(file);
  if (!parsed) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Invalid or missing session file</Text>
        <TouchableOpacity onPress={goBack}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { fileStartMs, fileEndMs, durationMs } = parsed;
  const screenWidth = Dimensions.get("window").width;
  const graphWidth = screenWidth * 0.6;

  /* ================= PLAYERS ================= */

  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    const list = getAssignedPlayersForSession(sessionId)
      .filter(p => p.assigned);
    setPlayers(list);
  }, [sessionId]);

  /* ================= TRIM STATE ================= */

  const [startRatio, setStartRatio] = useState(0);
  const [endRatio, setEndRatio] = useState(1);

  const startRef = useRef(0);
  const endRef = useRef(1);

  /* ================= PAN HANDLERS ================= */

  const startPan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        const dx = g.dx / graphWidth;
        let next = startRef.current + dx;
        next = Math.max(0, Math.min(next, endRef.current - HANDLE_GAP));
        setStartRatio(next);
      },
      onPanResponderRelease: () => {
        startRef.current = startRatio;
      },
    })
  ).current;

  const endPan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        const dx = g.dx / graphWidth;
        let next = endRef.current + dx;
        next = Math.min(1, Math.max(next, startRef.current + HANDLE_GAP));
        setEndRatio(next);
      },
      onPanResponderRelease: () => {
        endRef.current = endRatio;
      },
    })
  ).current;

  /* ================= TIMES ================= */

  const trimStartTs = fileStartMs + durationMs * startRatio;
  const trimEndTs = fileStartMs + durationMs * endRatio;

  /* ================= SAVE ================= */

  const onNext = async () => {
    await db.execute(
      `
      UPDATE sessions
      SET
        file_start_ts = ?,
        file_end_ts = ?,
        trim_start_ts = ?,
        trim_end_ts = ?
      WHERE session_id = ?
      `,
      [
        fileStartMs,
        fileEndMs,
        Math.round(trimStartTs),
        Math.round(trimEndTs),
        sessionId,
      ]
    );

    goNext({ file, sessionId, eventDraft });
  };

  /* ================= UI ================= */

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Trim Session</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* INSTRUCTION */}
      <Text style={styles.hint}>
        Drag the triangles to select the event time range
      </Text>

      {/* GRAPH */}
      <View style={styles.graphWrapper}>
        {/* HANDLES */}
        <View
          {...startPan.panHandlers}
          style={[styles.handle, { left: `${startRatio * 100}%` }]}
        />
        <View
          {...endPan.panHandlers}
          style={[styles.handle, { left: `${endRatio * 100}%` }]}
        />

        {/* ROWS */}
        {players.map((p, idx) => (
          <View key={p.player_id} style={styles.row}>
            <View style={styles.playerCell}>
              <Text style={styles.playerName}>{p.player_name}</Text>
            </View>

            <View style={styles.graphCell}>
              <View style={styles.waveBg} />

              <View
                style={[
                  styles.activeRange,
                  {
                    left: `${startRatio * 100}%`,
                    width: `${(endRatio - startRatio) * 100}%`,
                  },
                ]}
              />

              {/* Fake waveform */}
              <View style={styles.waveLine} />
            </View>
          </View>
        ))}
      </View>

      {/* RANGE LABEL */}
      <Text style={styles.rangeText}>
        Event time range: {formatTime(trimStartTs)} – {formatTime(trimEndTs)}
      </Text>

      {/* FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={goBack}>
          <Text style={styles.back}>BACK</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextBtn} onPress={onNext}>
          <Text style={styles.nextText}>NEXT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 16,
  },

  error: {
    color: "#DC2626",
    fontWeight: "700",
    textAlign: "center",
    marginTop: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  back: {
    color: "#2563EB",
    fontWeight: "700",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  hint: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 8,
    textAlign: "center",
  },

  graphWrapper: {
    position: "relative",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },

  handle: {
    position: "absolute",
    top: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#111827",
    zIndex: 10,
  },

  row: {
    flexDirection: "row",
    height: 50,
    alignItems: "center",
  },

  playerCell: {
    width: "40%",
    paddingLeft: 8,
  },

  playerName: {
    fontSize: 13,
    color: "#111827",
  },

  graphCell: {
    width: "60%",
    height: "100%",
    justifyContent: "center",
  },

  waveBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#E5F9F1",
  },

  activeRange: {
    position: "absolute",
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(34,197,94,0.35)",
  },

  waveLine: {
    height: 2,
    backgroundColor: "#64748B",
    marginHorizontal: 6,
  },

  rangeText: {
    marginTop: 8,
    fontSize: 13,
    textAlign: "center",
    color: "#334155",
    fontWeight: "600",
  },

  footer: {
    marginTop: "auto",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  nextBtn: {
    backgroundColor: "#16A34A",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
  },

  nextText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
