'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Alert, Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { FormTextField } from '@/components/inputs/FormTextField';
import { FormSkeleton } from '@/components/Skeleton/FormSkeleton';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createJobRequest, fetchJobRequest, updateJobRequest } from '@/store/jobs/jobsAction';
import { JOB_TYPES, JOB_TYPE_LABELS } from '@/constants/job';
import { selectGlobalLoading } from '@/store/ui/uiSlice';

const schema = yup.object({
  title: yup.string().min(3, 'Title must be at least 3 characters').required('Title is required'),
  description: yup
    .string()
    .min(20, 'Description must be at least 20 characters')
    .required('Description is required'),
  skills: yup.string().required('Skills are required'),
  salaryMin: yup.number().min(0).required(),
  salaryMax: yup.number().min(0).required(),
  jobType: yup
    .string()
    .oneOf([...JOB_TYPES])
    .required(),
  location: yup.string().min(2).required(),
  deadline: yup.string().required('Deadline is required'),
});

type FormValues = yup.InferType<typeof schema>;

type Props = {
  mode?: 'create' | 'edit';
};

export function JobCreateScreen({ mode = 'create' }: Props) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const jobId = params?.id;
  const job = useAppSelector((s) => s.jobs.current);
  const error = useAppSelector((s) => s.jobs.error);
  const loading = useAppSelector(selectGlobalLoading);
  const isEditMode = mode === 'edit' && Boolean(jobId);

  const { control, handleSubmit, reset } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      skills: '',
      salaryMin: 0,
      salaryMax: 0,
      jobType: 'FULL_TIME',
      location: '',
      deadline: '',
    },
  });

  useEffect(() => {
    if (isEditMode && jobId) {
      dispatch(fetchJobRequest({ jobId }));
    }
  }, [dispatch, isEditMode, jobId]);

  useEffect(() => {
    if (!isEditMode || !job || job._id !== jobId) return;
    reset({
      title: job.title,
      description: job.description,
      skills: job.skills.join(', '),
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      jobType: job.jobType,
      location: job.location,
      deadline: new Date(job.deadline).toISOString().slice(0, 16),
    });
  }, [isEditMode, job, jobId, reset]);

  if (isEditMode && loading && (!job || job._id !== jobId)) {
    return <FormSkeleton fields={7} />;
  }

  return (
    <Stack spacing={2} className="max-w-3xl">
      <Typography variant="h4">{isEditMode ? 'Edit job' : 'Create job'}</Typography>
      {error ? <Alert severity="error">{error}</Alert> : null}
      <form
        onSubmit={handleSubmit((values) => {
          const skills = values.skills
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
          const payload = {
            title: values.title,
            description: values.description,
            skills,
            salaryMin: Number(values.salaryMin),
            salaryMax: Number(values.salaryMax),
            jobType: values.jobType as (typeof JOB_TYPES)[number],
            location: values.location,
            deadline: values.deadline,
          };

          if (isEditMode && jobId) {
            dispatch(updateJobRequest({ jobId, body: payload }));
            router.push(`/dashboard/jobs/${jobId}`);
            return;
          }

          dispatch(createJobRequest(payload));
          router.push('/dashboard/jobs');
        })}
      >
        <FormTextField control={control} name="title" label="Title" />
        <FormTextField
          control={control}
          name="description"
          label="Description"
          multiline
          rows={5}
        />
        <FormTextField control={control} name="skills" label="Skills (comma separated)" />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <FormTextField control={control} name="salaryMin" label="Salary min" type="number" />
          <FormTextField control={control} name="salaryMax" label="Salary max" type="number" />
        </Stack>
        <Controller
          name="jobType"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              select
              label="Job type"
              fullWidth
              margin="normal"
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
            >
              {JOB_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {JOB_TYPE_LABELS[t]}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        <FormTextField control={control} name="location" label="Location" />
        <FormTextField control={control} name="deadline" label="Deadline" type="datetime-local" />
        <Button type="submit" className="mt-3" variant="contained">
          {isEditMode ? 'Save changes' : 'Publish job'}
        </Button>
      </form>
    </Stack>
  );
}
