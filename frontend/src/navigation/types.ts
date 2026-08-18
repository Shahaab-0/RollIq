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

export type AppTabsParamList = {
  Home: undefined;
  Log: NavigatorScreenParams<LogStackParamList>;
  Techniques: NavigatorScreenParams<TechniquesStackParamList>;
  Rolls: NavigatorScreenParams<RollsStackParamList>;
  Profile: undefined;
};
