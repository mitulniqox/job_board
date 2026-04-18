export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiValidationIssue = { path: string; message: string };

export type ApiErrorBody = {
  success: false;
  message: string;
  errors?: ApiValidationIssue[];
};
