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

/* ===== SUPER ADMIN (LAYOUT OWNER) ===== */
import SuperAdminHome from '../screens/SuperAdmin/SuperAdminHome';

/* ===== OTHER ROLES ===== */
import ClubAdminHome from '../screens/ClubAdmin/ClubAdminHome';
import CoachHome from '../screens/Coach/CoachHome';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="AuthLoadingScreen"
        screenOptions={{ headerShown: false }}
      >
        {/* AUTH */}
        <Stack.Screen name="AuthLoadingScreen" component={AuthLoadingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen name="ResetPassword" component={ResetPassword} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />

        {/* SUPER ADMIN */}
        <Stack.Screen
          name="SuperAdminHome"
          component={SuperAdminHome}
        />

        {/* OTHER ROLES */}
        <Stack.Screen name="ClubAdminHome" component={ClubAdminHome} />
        <Stack.Screen name="CoachHome" component={CoachHome} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
