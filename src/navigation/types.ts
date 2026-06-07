import { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Dashboard: undefined;
  Leads: undefined;
  Analytics: undefined;
  Notifications: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  LeadDetails: { leadId: string };
  AddLead: undefined;
  AssignLead: { leadId: string };
};
