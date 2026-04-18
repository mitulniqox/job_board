'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Alert, Button, Stack, Typography } from '@mui/material';
import { FormTextField } from '@/components/inputs/FormTextField';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMeRequest, updateMeRequest } from '@/store/auth/authAction';
import { clearAuthError, selectAuth } from '@/store/auth/authSlice';

const schema = yup.object({
  name: yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
  skills: yup.string().default(''),
  experience: yup
    .number()
    .transform((v, orig) => (orig === '' || orig === undefined ? 0 : Number(orig)))
    .min(0)
    .default(0),
  location: yup.string().default(''),
  resume: yup
    .string()
    .default('')
    .test(
      'resumeUrl',
      'Resume must be a valid URL or empty',
      (val) => !val || yup.string().url().isValidSync(val),
    ),
});

type FormValues = yup.InferType<typeof schema>;

export function ProfileScreen() {
  const dispatch = useAppDispatch();
  const { user, error } = useAppSelector(selectAuth);

  const { control, handleSubmit, reset } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      skills: '',
      experience: 0,
      location: '',
      resume: '',
    },
  });

  useEffect(() => {
    dispatch(fetchMeRequest());
  }, [dispatch]);

  useEffect(() => {
    if (!user) return;
    reset({
      name: user.name,
      skills: user.candidateProfile.skills.join(', '),
      experience: user.candidateProfile.experience,
      location: user.candidateProfile.location ?? '',
      resume: user.candidateProfile.resume ?? '',
    });
  }, [reset, user]);

  return (
    <Stack spacing={2} className="max-w-xl">
      <Typography variant="h4">Profile</Typography>
      {error ? (
        <Alert severity="error" onClose={() => dispatch(clearAuthError())}>
          {error}
        </Alert>
      ) : null}
      <form
        onSubmit={handleSubmit((values) => {
          dispatch(clearAuthError());
          const skills = values.skills
            ? values.skills
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
            : [];
          dispatch(
            updateMeRequest({
              name: values.name,
              candidateProfile: {
                skills,
                experience: Number(values.experience ?? 0),
                location: values.location ?? '',
                resume: values.resume ?? '',
              },
            }),
          );
        })}
      >
        <FormTextField control={control} name="name" label="Name" />
        <FormTextField control={control} name="skills" label="Skills (comma separated)" />
        <FormTextField
          control={control}
          name="experience"
          label="Experience (years)"
          type="number"
        />
        <FormTextField control={control} name="location" label="Location" />
        <FormTextField control={control} name="resume" label="Resume URL" />
        <Button type="submit" variant="contained" className="mt-3">
          Save changes
        </Button>
      </form>
    </Stack>
  );
}
