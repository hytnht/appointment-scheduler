import { toUtc } from '@src/shared/utils/date.helper';
import { Dealership } from '../dealership/entities/dealership.entity';
import { EResourceType, GRID_ANCHOR_UTC, SLOT_SIZE_MINUTES } from './contants/appointment.contanst';
import { Reservation } from './interfaces/resource-reservation.type';
import { validateDuration } from '../service-type/service-type.helper';

export function isGridAligned(startAt: Date, slotSize = SLOT_SIZE_MINUTES): boolean {
  const slotMs = slotSize * 60 * 1000;
  const diffMs = startAt.getTime() - GRID_ANCHOR_UTC;
  return diffMs % slotMs === 0;
}

export function mergeSlots(
  startAt: Date,
  durationMinutes: number,
  slotSize = SLOT_SIZE_MINUTES,
): Date[] {
  validateDuration(durationMinutes, slotSize);
  return Array.from(
    { length: durationMinutes / slotSize },
    (_, index) => new Date(startAt.getTime() + index * slotSize * 60 * 1000),
  );
}

export function getReserveKey({ resourceType, resourceId, slotStart }: Reservation): string {
  return `${resourceType}:${resourceId}:${slotStart.toISOString()}`;
}

/**
 * @description Builds an array of all candidate slot times within the dealership's operating hours.
 */
export function getDealershipSlots(
  dealershipTime: Pick<Dealership, 'openTime' | 'closeTime' | 'timezone'>,
  date: string,
  slotSizeMins = SLOT_SIZE_MINUTES,
): Date[] {
  const { openTime, closeTime, timezone } = dealershipTime;
  const openTimeUtc = toUtc(date, openTime, timezone).getTime();
  const closeTimeUtc = toUtc(date, closeTime, timezone).getTime();

  const slotSizeMs = slotSizeMins * 60 * 1000;
  const firstSlot =
    GRID_ANCHOR_UTC + Math.ceil((openTimeUtc - GRID_ANCHOR_UTC) / slotSizeMs) * slotSizeMs;
  const slots: Date[] = [];

  for (let start = firstSlot; start + slotSizeMs <= closeTimeUtc; start += slotSizeMs)
    slots.push(new Date(start));

  return slots;
}

export const hasFreeResource =
  (
    blocked: Set<string>,
    durationMinutes: number,
    activeResources: Record<EResourceType, number[]>,
  ) =>
  (startAt: Date): boolean => {
    const slots = mergeSlots(startAt, durationMinutes);
    return Object.entries(activeResources).every(([type, ids]) =>
      ids.some((resourceId) =>
        slots.every(
          (slotStart) =>
            !blocked.has(
              getReserveKey({ resourceType: type as EResourceType, resourceId, slotStart }),
            ),
        ),
      ),
    );
  };
