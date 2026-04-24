import { Appointment } from '@/types';

/** All possible clinic time slots (08:00–17:30, every 30 min) */
export const ALL_TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30',
];

/**
 * Returns time slots already booked for a given doctor on a given date.
 * Ignores cancelled appointments.
 */
export function getBookedSlots(
  appointments: Appointment[],
  doctorId: string,
  date: string,
  excludeId?: string,
): string[] {
  return appointments
    .filter(
      (a) =>
        a.doctorId === doctorId &&
        a.date === date &&
        a.status !== 'cancelled' &&
        a.id !== excludeId,
    )
    .map((a) => a.time);
}

/**
 * Checks whether a specific slot is already taken.
 */
export function isSlotBooked(
  appointments: Appointment[],
  doctorId: string,
  date: string,
  time: string,
  excludeId?: string,
): boolean {
  return getBookedSlots(appointments, doctorId, date, excludeId).includes(time);
}

/**
 * For today, filter out slots that are in the past.
 */
export function getAvailableSlots(
  appointments: Appointment[],
  doctorId: string,
  date: string,
  today: string,
  nowTime: string,
): { time: string; booked: boolean; past: boolean }[] {
  const booked = getBookedSlots(appointments, doctorId, date);
  return ALL_TIME_SLOTS.map((time) => ({
    time,
    booked: booked.includes(time),
    past: date === today && time <= nowTime,
  }));
}
