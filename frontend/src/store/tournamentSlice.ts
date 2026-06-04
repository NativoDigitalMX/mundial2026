import { createSlice } from '@reduxjs/toolkit';
import type {  PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import type { TournamentState, Team } from '../types/tournament';
import { INITIAL_GROUPS } from '../data/teams'; // Importar los grupos iniciales

const initialState: TournamentState = {
  groups: INITIAL_GROUPS, // Usar los grupos importados
  userPredictions: [],
  currentPredictionId: null,
  currentStep: 1,
  totalSteps: 7,
  isLoading: false,
  error: null,
};

const tournamentSlice = createSlice({
  name: 'tournament',
  initialState,
  reducers: {
    startNewPrediction: (state, action: PayloadAction<string>) => {
      const newPrediction = {
        id: uuidv4(),
        userName: action.payload,
        groupSelections: {},
        bestThirdPlaces: [],
        knockoutPredictions: {
          roundOf32: Array(32).fill(null),
          roundOf16: Array(16).fill(null),
          quarterFinals: Array(8).fill(null),
          semiFinals: Array(4).fill(null),
          thirdPlace: null,
          final: null,
          champion: null,
          runnerUp: null,
        },
        timestamp: Date.now(),
        completed: false,
      };
      
      state.userPredictions.push(newPrediction);
      state.currentPredictionId = newPrediction.id;
      state.currentStep = 1;
    },

    updateGroupSelection: (state, action: PayloadAction<{
      groupId: string;
      position: 'first' | 'second' | 'third' | 'fourth';
      team: Team;
    }>) => {
      const { groupId, position, team } = action.payload;
      const prediction = state.userPredictions.find(p => p.id === state.currentPredictionId);
      
      if (prediction) {
        if (!prediction.groupSelections[groupId]) {
          prediction.groupSelections[groupId] = {
            first: null,
            second: null,
            third: null,
            fourth: null,
          };
        }
        
        prediction.groupSelections[groupId][position] = team;
      }
    },

    goToNextStep: (state) => {
      if (state.currentStep < state.totalSteps) {
        state.currentStep += 1;
      }
    },

    goToPreviousStep: (state) => {
      if (state.currentStep > 1) {
        state.currentStep -= 1;
      }
    },

    setCurrentStep: (state, action: PayloadAction<number>) => {
      const step = action.payload;
      if (step >= 1 && step <= state.totalSteps) {
        state.currentStep = step;
      }
    },
  },
});

export const {
  startNewPrediction,
  updateGroupSelection,
  goToNextStep,
  goToPreviousStep,
  setCurrentStep,
} = tournamentSlice.actions;

export default tournamentSlice.reducer;