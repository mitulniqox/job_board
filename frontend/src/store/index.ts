'use client';

import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { createTransform, persistReducer, persistStore, type PersistConfig } from 'redux-persist';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';

const createNoopStorage = () => ({
  getItem: async () => null,
  setItem: async (_k: string, v: string) => v,
  removeItem: async () => undefined,
});

const storage = typeof window === 'undefined' ? createNoopStorage() : createWebStorage('local');
import { rootReducer } from '@/store/Saga';
import type { AuthState } from '@/store/auth/authSlice';
import rootSagas from '@/store/Saga/rootSagas';
import { injectStore } from '@/utils/axios';

const sagaMiddleware = createSagaMiddleware();

const authPersistTransform = createTransform<AuthState, AuthState>(
  (inboundState) => ({
    ...inboundState,
    accessToken: null,
    refreshToken: inboundState.refreshToken,
    error: null,
    isAuthResolved: false,
  }),
  (outboundState) => ({
    user: outboundState.user ?? null,
    accessToken: null,
    refreshToken: outboundState.refreshToken ?? null,
    error: null,
    isAuthResolved: false,
  }),
  { whitelist: ['auth'] },
);

const persistConfig: PersistConfig<ReturnType<typeof rootReducer>> = {
  key: 'root',
  storage,
  whitelist: ['auth'],
  transforms: [authPersistTransform],
};

const persistedReducer = persistReducer(
  persistConfig,
  rootReducer,
) as unknown as typeof rootReducer;

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSagas);
injectStore(store);

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
