import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

/* ===== AUTH SCREENS ===== */
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import ForgotPassword from '../screens/Auth/ForgotPassword';
import ResetPassword from '../screens/Auth/ResetPassword';
import AuthLoadingScreen from '../screens/Auth/AuthLoadingScreen';
import ChangePasswordScreen from '../screens/Auth/ChangePasswordScreen';

/* ===== SUPER ADMIN ===== */
import SuperAdminHome from '../screens/SuperAdmin/SuperAdminHome';
import ProfileEditScreen from '../screens/SuperAdmin/ProfileEditScreen';
import CreateClub from '../screens/SuperAdmin/CreateClub';
import EditClub from '../screens/SuperAdmin/EditClub';
import SettingsScreen from '../screens/SuperAdmin/SettingsScreen';

/* ===== OTHERS ===== */
import ClubAdminHome from '../screens/ClubAdmin/ClubAdminHome';
import CoachHome from '../screens/Coach/CoachHome';

/* ================= TYPES ================= */
export type RootStackParamList = {
  AuthLoadingScreen: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;
  ChangePassword: undefined; // ✅ ADDED

  SuperAdminHome: undefined;
  ClubAdminHome: undefined;
  CoachHome: undefined;

  ProfileEdit: undefined;
  CreateClub: undefined;
  EditClub: { clubId: string };
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/* ================= NAVIGATOR ================= */
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="AuthLoadingScreen"
        screenOptions={{ headerShown: false }}
      >
        {/* AUTH */}
        <Stack.Screen
          name="AuthLoadingScreen"
          component={AuthLoadingScreen}
        />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen name="ResetPassword" component={ResetPassword} />
        <Stack.Screen
          name="ChangePassword"
          component={ChangePasswordScreen}
        />

        {/* SUPER ADMIN */}
        <Stack.Screen
          name="SuperAdminHome"
          component={SuperAdminHome}
        />
        <Stack.Screen
          name="ProfileEdit"
          component={ProfileEditScreen}
        />
        <Stack.Screen name="CreateClub" component={CreateClub} />
        <Stack.Screen name="EditClub" component={EditClub} />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
        />

        {/* OTHERS */}
        <Stack.Screen
          name="ClubAdminHome"
          component={ClubAdminHome}
        />
        <Stack.Screen
          name="CoachHome"
          component={CoachHome}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
