'use client';

import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { TextField, type TextFieldProps } from '@mui/material';

type Props<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  type?: TextFieldProps['type'];
  multiline?: boolean;
  rows?: number;
  disabled?: boolean;
  autoComplete?: string;
};

export function FormTextField<T extends FieldValues>({
  name,
  control,
  label,
  type = 'text',
  multiline,
  rows,
  disabled,
  autoComplete,
}: Props<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          label={label}
          type={type}
          multiline={multiline}
          rows={rows}
          disabled={disabled}
          autoComplete={autoComplete}
          fullWidth
          margin="normal"
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message}
        />
      )}
    />
  );
}
