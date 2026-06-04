export interface Team {
  id: string;
  name: string;
  code: string;
  group: string;
  flag: string;
  isHost?: boolean;
}

export interface Group {
  id: string;
  name: string;
  teams: Team[];
}

export interface GroupSelection {
  //groupId: string;
  first: Team | null;
  second: Team | null;
  third: Team | null;
  fourth: Team | null;
}

export interface UserPrediction {
  id: string;
  userName: string;
  groupSelections: Record<string, Omit<GroupSelection, 'groupId'>>;
  bestThirdPlaces: Team[];
  knockoutPredictions: {
    roundOf32: (Team | null)[];
    roundOf16: (Team | null)[];
    quarterFinals: (Team | null)[];
    semiFinals: (Team | null)[];
    thirdPlace: Team | null;
    final: Team | null;
    champion: Team | null;
    runnerUp: Team | null;
  };
  timestamp: number;
  completed: boolean;
}

export interface TournamentState {
  groups: Group[];
  userPredictions: UserPrediction[];
  currentPredictionId: string | null;
  currentStep: number;
  totalSteps: number;
  isLoading: boolean;
  error: string | null;
}

