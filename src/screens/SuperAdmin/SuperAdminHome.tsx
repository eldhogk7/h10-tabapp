import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';

import SidebarSuperAdmin from '../../components/Sidebar/SidebarSuperAdmin';
import SuperAdminNavbar from '../../components/Navbar/SuperAdminNavbar';

/* ===== SCREENS ===== */
import Dashboard from './Dashboard';
import CreateCoach from './CreateCoach';
import ClubsList from './ClubsList';
import PodManagementScreen from './PodManagementScreen';

import { ScreenType } from '../../components/Sidebar/SidebarSuperAdmin';

/* ===== CONSTANTS ===== */
const NAVBAR_HEIGHT = 56;
const STATUS_BAR_HEIGHT =
  Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

const SuperAdminHome = () => {
  /* 🔥 DEFAULT SCREEN = POD MANAGEMENT */
  const [activeScreen, setActiveScreen] =
    useState<ScreenType>('PodManagement');

  const [collapsed, setCollapsed] = useState(false);

  /* ===== SCREEN RENDERER ===== */
  const renderScreen = () => {
    switch (activeScreen) {
      case 'PodManagement':
        return <PodManagementScreen />;

      case 'CreateCoach':
        return <CreateCoach />;

      case 'Clubs':
        return <ClubsList />;

      case 'Dashboard':
      default:
        return <Dashboard />;
    }
  };

  return (
    <View style={styles.root}>
      {/* STATUS BAR */}
      <StatusBar translucent backgroundColor="transparent" />

      {/* NAVBAR */}
      <View style={styles.navbarWrapper}>
        <SuperAdminNavbar />
      </View>

      {/* BODY */}
      <View style={styles.body}>
        {/* SIDEBAR */}
        <View style={styles.sidebarWrapper}>
          <SidebarSuperAdmin
            active={activeScreen}
            setActive={setActiveScreen}
            collapsed={collapsed}
            toggleSidebar={() => setCollapsed(v => !v)}
          />
        </View>

        {/* CONTENT */}
        <View style={styles.content}>
          {renderScreen()}
        </View>
      </View>
    </View>
  );
};

export default SuperAdminHome;

/* ===== STYLES ===== */
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },

  navbarWrapper: {
    height: NAVBAR_HEIGHT + STATUS_BAR_HEIGHT,
    zIndex: 100,
  },

  body: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
  },

  sidebarWrapper: {
    backgroundColor: '#000000',
  },

  content: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
});
