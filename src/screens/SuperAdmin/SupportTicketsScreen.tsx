import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../components/context/ThemeContext';

const SupportTicketsScreen = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const colors = {
    bg: isDark ? '#020617' : '#F8FAFC',
    card: isDark ? '#0F172A' : '#FFFFFF',
    text: isDark ? '#E5E7EB' : '#0F172A',
    subText: isDark ? '#94A3B8' : '#475569',
    border: isDark ? '#1E293B' : '#E5E7EB',
    green: '#22C55E',
  };

  return (
    <View style={[styles.page, { backgroundColor: colors.bg }]}>
      <View style={styles.centerWrapper}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons
            name="help-circle-outline"
            size={56}
            color={colors.green}
            style={{ marginBottom: 16 }}
          />

          <Text style={[styles.title, { color: colors.text }]}>
            Support Tickets
          </Text>

          <Text style={[styles.subtitle, { color: colors.green }]}>
            Support system is coming soon
          </Text>

          <Text style={[styles.note, { color: colors.subText }]}>
            You’ll be able to view, assign, and resolve
            support requests from users here.
          </Text>
        </View>
      </View>
    </View>
  );
};

export default SupportTicketsScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },

  centerWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
  },

  title: {
    fontSize: 22,
    fontWeight: '800',
  },

  subtitle: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },

  note: {
    marginTop: 12,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
