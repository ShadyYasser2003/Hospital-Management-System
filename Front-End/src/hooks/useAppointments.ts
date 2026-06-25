import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import appointmentService, { CreateAppointmentPayload } from '@/services/appointmentService';

export const APPOINTMENTS_KEY = 'appointments';

export const useAppointments = () =>
  useQuery({
    queryKey: [APPOINTMENTS_KEY],
    queryFn: appointmentService.getAll,
  });

export const useAppointmentsByDoctor = (doctorId: number | string | undefined) =>
  useQuery({
    queryKey: [APPOINTMENTS_KEY, 'doctor', doctorId],
    queryFn: () => appointmentService.getByDoctor(Number(doctorId)),
    enabled: !!doctorId,
  });

export const useAppointmentsByPatient = (patientId: number | string | undefined) =>
  useQuery({
    queryKey: [APPOINTMENTS_KEY, 'patient', patientId],
    queryFn: () => appointmentService.getByPatient(Number(patientId)),
    enabled: !!patientId,
  });

export const useCreateAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAppointmentPayload) => appointmentService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [APPOINTMENTS_KEY] }),
  });
};

export const useConfirmAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => appointmentService.confirm(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [APPOINTMENTS_KEY] }),
  });
};

export const useCompleteAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => appointmentService.complete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [APPOINTMENTS_KEY] }),
  });
};

export const useCancelAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => appointmentService.cancel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [APPOINTMENTS_KEY] }),
  });
};
