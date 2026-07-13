export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};

export type AppTabsParamList = {
  Home: undefined;
  Log: undefined;
  Techniques: undefined;
  Rolls: undefined;
  Profile: undefined;
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
