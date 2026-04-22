'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormHelperText,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { FormTextField } from '@/components/inputs/FormTextField';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { registerRequest } from '@/store/auth/authAction';
import { clearAuthError, selectAuth, selectIsAuthenticated } from '@/store/auth/authSlice';
import { authAPI } from '@/store/auth/authAPI';
import { USER_ROLES } from '@/constants/roles';
import { getApiErrorMessage } from '@/utils/axios';

const schema = yup.object({
  name: yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  role: yup
    .string()
    .oneOf([...USER_ROLES])
    .required(),
  skills: yup.string().default(''),
  experience: yup
    .number()
    .transform((v, orig) => (orig === '' || orig === undefined ? 0 : Number(orig)))
    .min(0)
    .default(0),
  location: yup.string().default(''),
});

type FormValues = yup.InferType<typeof schema>;

export function RegisterScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { error } = useAppSelector(selectAuth);

  const { control, handleSubmit, watch } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'CANDIDATE',
      skills: '',
      experience: 0,
      location: '',
    },
  });

  const role = watch('role');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  useEffect(() => {
    if (isAuthenticated) router.replace('/dashboard');
  }, [isAuthenticated, router]);

  return (
    <Box className="flex min-h-[calc(100vh-0px)] items-center justify-center p-4">
      <Card className="w-full max-w-lg" variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h5">Create account</Typography>
            {error ? (
              <Alert severity="error" onClose={() => dispatch(clearAuthError())}>
                {error}
              </Alert>
            ) : null}
            <form
              onSubmit={handleSubmit(async (values) => {
                dispatch(clearAuthError());
                setResumeError(null);

                let resume = '';
                if (values.role === 'CANDIDATE') {
                  if (!resumeFile) {
                    setResumeError('Resume file is required for candidates.');
                    return;
                  }

                  try {
                    setIsUploadingResume(true);
                    const uploadResponse = await authAPI.uploadResume(resumeFile);
                    resume = uploadResponse.data.resumeUrl;
                  } catch (error) {
                    setResumeError(getApiErrorMessage(error, 'Unable to upload resume'));
                    return;
                  } finally {
                    setIsUploadingResume(false);
                  }
                }

                const skills = values.skills
                  ? values.skills
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean)
                  : [];
                dispatch(
                  registerRequest({
                    name: values.name,
                    email: values.email,
                    password: values.password,
                    role: values.role,
                    candidateProfile:
                      values.role === 'CANDIDATE'
                        ? {
                            skills,
                            experience: values.experience,
                            location: values.location ?? '',
                            resume,
                          }
                        : undefined,
                  }),
                );
              })}
            >
              <FormTextField control={control} name="name" label="Full name" autoComplete="name" />
              <FormTextField control={control} name="email" label="Email" autoComplete="email" />
              <FormTextField
                control={control}
                name="password"
                label="Password"
                type="password"
                autoComplete="new-password"
              />
              <Controller
                name="role"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    select
                    label="Role"
                    fullWidth
                    margin="normal"
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  >
                    {USER_ROLES.map((r) => (
                      <MenuItem key={r} value={r}>
                        {r}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              {role === 'CANDIDATE' ? (
                <>
                  <FormTextField
                    control={control}
                    name="skills"
                    label="Skills (comma separated)"
                    autoComplete="off"
                  />
                  <FormTextField
                    control={control}
                    name="experience"
                    label="Years of experience"
                    type="number"
                  />
                  <FormTextField control={control} name="location" label="Location" />
                  <Stack spacing={0.75} className="mt-4">
                    <Button variant="outlined" component="label">
                      {resumeFile ? `Resume selected: ${resumeFile.name}` : 'Upload resume'}
                      <input
                        hidden
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={(event) => {
                          const file = event.target.files?.[0] ?? null;
                          setResumeFile(file);
                          setResumeError(null);
                        }}
                      />
                    </Button>
                    <FormHelperText>
                      Accepted formats: PDF, DOC, DOCX. Maximum size: 5MB.
                    </FormHelperText>
                    {resumeError ? <FormHelperText error>{resumeError}</FormHelperText> : null}
                  </Stack>
                </>
              ) : null}
              <Button
                type="submit"
                fullWidth
                className="mt-3"
                size="large"
                disabled={isUploadingResume}
              >
                Register
              </Button>
            </form>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link href="/login" className="underline">
                Login
              </Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
