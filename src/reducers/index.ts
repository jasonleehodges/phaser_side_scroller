import { Action, ThunkAction, configureStore } from '@reduxjs/toolkit';

import { createReducer } from '@reduxjs/toolkit';
import { setUserHealth } from '../actions';

export interface defaultState {
    userHealth: number,
}

export const initState: defaultState = {
    userHealth: 100,
}

export const defaultReducer = createReducer(initState, (builder) => {
    builder.addCase(setUserHealth, (state) => ({
        ...state,
        userHealth: state.userHealth >= 0 ? state.userHealth - 10 : 0,
    }))
});

export const store = configureStore({
  reducer: {
    defaultState: defaultReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
