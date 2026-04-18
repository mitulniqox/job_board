'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Alert, Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { FormTextField } from '@/components/inputs/FormTextField';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginRequest } from '@/store/auth/authAction';
import { clearAuthError, selectAuth, selectIsAuthenticated } from '@/store/auth/authSlice';

const schema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

type FormValues = yup.InferType<typeof schema>;

export function LoginScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useSearchParams();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { error } = useAppSelector(selectAuth);

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    const next = params.get('next');
    router.replace(next && next.startsWith('/') ? next : '/dashboard');
  }, [isAuthenticated, params, router]);

  return (
    <Box className="flex min-h-[calc(100vh-0px)] items-center justify-center p-4">
      <Card className="w-full max-w-md" variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h5">Sign in</Typography>
            {error ? (
              <Alert severity="error" onClose={() => dispatch(clearAuthError())}>
                {error}
              </Alert>
            ) : null}
            <form
              onSubmit={handleSubmit((values) => {
                dispatch(clearAuthError());
                dispatch(loginRequest(values));
              })}
            >
              <FormTextField control={control} name="email" label="Email" autoComplete="email" />
              <FormTextField
                control={control}
                name="password"
                label="Password"
                type="password"
                autoComplete="current-password"
              />
              <Button type="submit" fullWidth className="mt-3" size="large">
                Continue
              </Button>
            </form>
            <Typography variant="body2" color="text.secondary">
              No account yet?{' '}
              <Link href="/register" className="underline">
                Register
              </Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
