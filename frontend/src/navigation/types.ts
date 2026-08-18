import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};

export type LogStackParamList = {
  TrainingLog: undefined;
  LogSessionForm: { sessionId?: string } | undefined;
};

export type TechniquesStackParamList = {
  TechniqueLibrary: undefined;
  TechniqueForm: { techniqueId?: string } | undefined;
};

export type RollsStackParamList = {
  RollTracker: undefined;
  LogRollForm: { rollId?: string } | undefined;
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

export type AppTabsParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Log: NavigatorScreenParams<LogStackParamList>;
  Techniques: NavigatorScreenParams<TechniquesStackParamList>;
  Instructionals: NavigatorScreenParams<InstructionalsStackParamList>;
  Rolls: NavigatorScreenParams<RollsStackParamList>;
  Profile: undefined;
};
