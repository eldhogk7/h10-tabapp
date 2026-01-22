import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { getPlayersFromSQLite } from "../../services/playerCache.service";
import { saveSessionPlayers } from "../../services/sessionPlayer.service";

export default function AssignPlayersForSessionScreen({
  sessionId,
  eventDraft,
  goNext,
  goBack,
}: any) {
  const [players, setPlayers] = useState<any[]>([]);
  const [assigned, setAssigned] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const load = async () => {
      const list = getPlayersFromSQLite();

      const map: Record<string, boolean> = {};
      list.forEach(p => (map[p.player_id] = true)); // default assigned

      setPlayers(list);
      setAssigned(map);
    };

    load();
  }, []);

  const toggle = (playerId: string) => {
    setAssigned(prev => ({
      ...prev,
      [playerId]: !prev[playerId],
    }));
  };

  const onNext = async () => {
    await saveSessionPlayers(sessionId, assigned);

    goNext({
      step: "Trim",
      file: sessionId + ".csv",
      eventDraft,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Assign Players</Text>

        <View style={{ width: 40 }} />
      </View>
      <FlatList
        data={players}
        keyExtractor={p => p.player_id}
        contentContainerStyle={{ paddingBottom: 80 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.row,
              !assigned[item.player_id] && styles.unassigned,
            ]}
            onPress={() => toggle(item.player_id)}
          >
            <Text>{item.player_name}</Text>
            <Text>
              {assigned[item.player_id] ? "✓ Playing" : "✗ Not Playing"}
            </Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.nextBtn} onPress={onNext}>
        <Text style={{ color: "#fff" }}>NEXT</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F8FAFC',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
  },

  card: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  assigned: {
    borderColor: '#16A34A',
    backgroundColor: '#ECFDF5',
  },

  unassigned: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },

  button: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
  },

  primaryBtn: {
    backgroundColor: '#2563EB',
  },

  secondaryBtn: {
    backgroundColor: '#E5E7EB',
  },

  btnText: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  nextBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  row: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
});
