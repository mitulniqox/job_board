'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMeRequest, restoreSessionRequest } from '@/store/auth/authAction';
import { selectAuth, setAuthResolved } from '@/store/auth/authSlice';

export function AuthBootstrap() {
  const dispatch = useAppDispatch();
  const { accessToken, refreshToken, isAuthResolved } = useAppSelector(selectAuth);
  const bootstrapped = useRef(false);

  useEffect(() => {
    if (isAuthResolved) {
      bootstrapped.current = false;
      return;
    }

    if (bootstrapped.current) return;
    bootstrapped.current = true;

    if (accessToken) {
      dispatch(fetchMeRequest());
      return;
    }

    if (refreshToken) {
      dispatch(restoreSessionRequest());
      return;
    }

    dispatch(setAuthResolved(true));
  }, [accessToken, dispatch, isAuthResolved, refreshToken]);

  return null;
}
