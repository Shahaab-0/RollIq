import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email: string };
};

export type LogStackParamList = {
  TrainingLog: undefined;
  LogSessionForm: { sessionId?: string } | undefined;
};

export type TechniquesStackParamList = {
  TechniqueLibrary: undefined;
  TechniqueForm: { techniqueId?: string } | undefined;
  TechniqueVideoPlayer: { name: string; url: string };
};

export type RollsStackParamList = {
  RollTracker: undefined;
  LogRollForm: { rollId?: string } | undefined;
  PartnerHistory: undefined;
};

export type InstructionalsStackParamList = {
  InstructionalLibrary: undefined;
  InstructionalForm: undefined;
  InstructionalVideoForm: { instructionalId: string };
  InstructionalPlayer: { title: string; url: string };
};

// Gyms has no bottom tab of its own -- it's reached by pushing screens on
// top of the Dashboard, same navigator as "Home".
export type HomeStackParamList = {
  Dashboard: undefined;
  GymList: undefined;
  GymForm: undefined;
  GymJoin: undefined;
  GymDetail: { gymId: string };
  GymMembers: { gymId: string };
  GymScheduleForm: { gymId: string };
  GymClassForm: { gymId: string };
  GymClassDetail: { gymId: string; classId: string };
  GymClassVideoForm: { gymId: string; classId: string };
  GymVideoPlayer: { url: string; techniques: string[] };
};

export type InjuriesStackParamList = {
  InjuryList: undefined;
  InjuryForm: { injuryId?: string } | undefined;
};

export type CompetitionsStackParamList = {
  CompetitionList: undefined;
  CompetitionForm: { competitionId?: string } | undefined;
  CompetitionDetail: { competitionId: string };
  CompetitionMatchForm: { competitionId: string; matchId?: string };
};

export type AppTabsParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Log: NavigatorScreenParams<LogStackParamList>;
  Techniques: NavigatorScreenParams<TechniquesStackParamList>;
  Competitions: NavigatorScreenParams<CompetitionsStackParamList>;
  Profile: undefined;
};

// The drawer sits above the tab bar -- "Main" is the existing 5-tab bar,
// "Rolls", "Injuries", and "Instructionals" are secondary features reached
// via the drawer instead of extra bottom tabs.
export type AppDrawerParamList = {
  Main: NavigatorScreenParams<AppTabsParamList>;
  Rolls: NavigatorScreenParams<RollsStackParamList>;
  Injuries: NavigatorScreenParams<InjuriesStackParamList>;
  Instructionals: NavigatorScreenParams<InstructionalsStackParamList>;
};
