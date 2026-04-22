'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Alert, Button, FormHelperText, Link, Stack, Typography } from '@mui/material';
import { FormTextField } from '@/components/inputs/FormTextField';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMeRequest, updateMeRequest } from '@/store/auth/authAction';
import { clearAuthError, selectAuth } from '@/store/auth/authSlice';
import { authAPI } from '@/store/auth/authAPI';
import { getApiErrorMessage } from '@/utils/axios';

const schema = yup.object({
  name: yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
  skills: yup.string().default(''),
  experience: yup
    .number()
    .transform((v, orig) => (orig === '' || orig === undefined ? 0 : Number(orig)))
    .min(0)
    .default(0),
  location: yup.string().default(''),
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
    },
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const resumeUrl = user?.candidateProfile.resume ?? '';
  const publicResumeUrl = resumeUrl;

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
        onSubmit={handleSubmit(async (values) => {
          dispatch(clearAuthError());
          setResumeError(null);

          let uploadedResumeUrl = resumeUrl;
          if (resumeFile) {
            try {
              setIsUploadingResume(true);
              const uploadResponse = await authAPI.uploadResume(resumeFile);
              uploadedResumeUrl = uploadResponse.data.resumeUrl;
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
            updateMeRequest({
              name: values.name,
              candidateProfile: {
                skills,
                experience: Number(values.experience ?? 0),
                location: values.location ?? '',
                resume: uploadedResumeUrl,
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
        <Stack spacing={0.75} className="mt-4">
          <Button variant="outlined" component="label">
            {resumeFile ? `Resume selected: ${resumeFile.name}` : 'Upload new resume'}
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
          {publicResumeUrl ? (
            <Link href={publicResumeUrl} target="_blank" rel="noreferrer" underline="hover">
              View current resume
            </Link>
          ) : null}
          <FormHelperText>Accepted formats: PDF, DOC, DOCX. Maximum size: 5MB.</FormHelperText>
          {resumeError ? <FormHelperText error>{resumeError}</FormHelperText> : null}
        </Stack>
        <Button type="submit" variant="contained" className="mt-3" disabled={isUploadingResume}>
          Save changes
        </Button>
      </form>
    </Stack>
  );
}
