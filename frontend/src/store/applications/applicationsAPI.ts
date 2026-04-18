import { api } from '@/utils/axios';
import type { ApiSuccess } from '@/types/api';
import type { Application } from '@/types/application';
import type { ApplyPayload, UpdateApplicationStatusPayload } from './applicationsAction';

export const applicationsAPI = {
  apply: async ({ jobId, body }: ApplyPayload) => {
    const res = await api.post<ApiSuccess<Application>>(`/jobs/${jobId}/apply`, body);
    return res.data;
  },
  myApplications: async () => {
    const res = await api.get<ApiSuccess<Application[]>>('/applications/me');
    return res.data;
  },
  jobApplications: async (jobId: string) => {
    const res = await api.get<ApiSuccess<Application[]>>(`/jobs/${jobId}/applications`);
    return res.data;
  },
  candidateApplications: async (candidateId: string) => {
    const res = await api.get<ApiSuccess<Application[]>>(`/candidates/${candidateId}/applications`);
    return res.data;
  },
  updateStatus: async ({ applicationId, status }: UpdateApplicationStatusPayload) => {
    const res = await api.patch<ApiSuccess<Application>>(`/applications/${applicationId}/status`, {
      status,
    });
    return res.data;
  },
};
