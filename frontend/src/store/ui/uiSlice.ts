import { createSlice } from '@reduxjs/toolkit';

type UiState = {
  loadingCount: number;
};

const initialState: UiState = {
  loadingCount: 0,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    startLoading(state) {
      state.loadingCount += 1;
    },
    stopLoading(state) {
      state.loadingCount = Math.max(0, state.loadingCount - 1);
    },
  },
});

export const { startLoading, stopLoading } = uiSlice.actions;
export default uiSlice.reducer;

export const selectGlobalLoading = (state: { ui: UiState }) => state.ui.loadingCount > 0;
