import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import radiologyService, { CreateRadiologyOrderPayload, EnterRadiologyReportPayload } from '@/services/radiologyService';

export const RADIOLOGY_KEY = 'radiologyOrders';

export const useRadiologyOrders = () =>
  useQuery({ queryKey: [RADIOLOGY_KEY], queryFn: radiologyService.getAll });

export const useRadiologyOrderById = (id: number | string | undefined) =>
  useQuery({ queryKey: [RADIOLOGY_KEY, id], queryFn: () => radiologyService.getById(id!), enabled: !!id });

export const useRadiologyOrdersByDoctor = (doctorId: number | string | undefined) =>
  useQuery({ queryKey: [RADIOLOGY_KEY, 'doctor', doctorId], queryFn: () => radiologyService.getByDoctor(doctorId!), enabled: !!doctorId });

export const useRadiologyOrdersByPatient = (patientId: number | string | undefined) =>
  useQuery({ queryKey: [RADIOLOGY_KEY, 'patient', patientId], queryFn: () => radiologyService.getByPatient(patientId!), enabled: !!patientId });

export const useRadiologyOrdersByTechnician = (technicianId: number | string | undefined) =>
  useQuery({
    queryKey: [RADIOLOGY_KEY, 'technician', technicianId],
    queryFn: () => radiologyService.getByTechnician(technicianId!),
    enabled: !!technicianId,
  });

export const useRadiologyOrdersByStatus = (status: string) =>
  useQuery({
    queryKey: [RADIOLOGY_KEY, 'status', status],
    queryFn: () => radiologyService.getByStatus(status),
  });

export const useCriticalRadiologyOrders = () =>
  useQuery({ queryKey: [RADIOLOGY_KEY, 'critical'], queryFn: radiologyService.getCritical });

const invalidateRad = (qc: ReturnType<typeof useQueryClient>) =>
  qc.invalidateQueries({ queryKey: [RADIOLOGY_KEY] });

export const useCreateRadiologyOrder = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (p: CreateRadiologyOrderPayload) => radiologyService.create(p), onSuccess: () => invalidateRad(qc) });
};

export const useAssignRadiologyTechnician = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, technicianId }: { id: number | string; technicianId: number | string }) =>
      radiologyService.assignTechnician(id, technicianId),
    onSuccess: () => invalidateRad(qc),
  });
};

export const useScheduleRadiologyOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, scheduledAt }: { id: number | string; scheduledAt: string }) =>
      radiologyService.schedule(id, scheduledAt),
    onSuccess: () => invalidateRad(qc),
  });
};

export const useEnterRadiologyReport = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: EnterRadiologyReportPayload }) =>
      radiologyService.enterReport(id, payload),
    onSuccess: () => invalidateRad(qc),
  });
};

export const useDeleteRadiologyOrder = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: number | string) => radiologyService.delete(id), onSuccess: () => invalidateRad(qc) });
};

/** @deprecated Use useAssignRadiologyTechnician — will be removed in next cleanup pass */
export const useTakeRadiologyOrder = useAssignRadiologyTechnician;
