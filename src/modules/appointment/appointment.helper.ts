import { toUtc } from '@src/shared/utils/date.helper';
import { Dealership } from '../dealership/entities/dealership.entity';
import {
  EResourceType,
  GRID_ANCHOR_UTC,
  SLOT_SIZE_MINUTES,
  TOP_K_RESOURCES,
} from './constants/appointment.constant';
import { Reservation } from './interfaces/resource-reservation.type';
import { validateDuration } from '../service-type/service-type.helper';
import { shuffle } from '@src/shared/utils/common.helper';
import { ResourceReservation } from './entities/resource-reservation.entity';

export function isGridAligned(startAt: Date, slotSize = SLOT_SIZE_MINUTES): boolean {
  return (toUtc(startAt).getTime() - GRID_ANCHOR_UTC) % (slotSize * 60 * 1000) === 0;
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
 * @description Builds an array of candidate slot times within the dealership's operating hours.
 */
export function getDealershipSlots(
  dealershipTime: Pick<Dealership, 'openTime' | 'closeTime' | 'timezone'>,
  date: string,
  durationMinutes: number,
  slotSizeMins = SLOT_SIZE_MINUTES,
): Date[] {
  const { openTime, closeTime, timezone } = dealershipTime;
  const openTimeUtc = toUtc(date, openTime, timezone).getTime();
  const closeTimeUtc = toUtc(date, closeTime, timezone).getTime();

  const slotSizeMs = slotSizeMins * 60 * 1000;
  const durationMs = durationMinutes * 60 * 1000;
  const firstSlot =
    GRID_ANCHOR_UTC + Math.ceil((openTimeUtc - GRID_ANCHOR_UTC) / slotSizeMs) * slotSizeMs;
  const slots: Date[] = [];

  for (let start = firstSlot; start + durationMs <= closeTimeUtc; start += slotSizeMs)
    slots.push(new Date(start));

  return slots;
}
const isResourceFree = (
  slots: Date[],
  blocked: Set<string>,
  type: EResourceType,
  resourceId: number,
): boolean => {
  return slots.every(
    (slotStart) => !blocked.has(getReserveKey({ resourceType: type, resourceId, slotStart })),
  );
};
export const hasFreeResource =
  (
    blocked: Set<string>,
    durationMinutes: number,
    activeResources: Record<EResourceType, number[]>,
  ) =>
  (startAt: Date): boolean => {
    const slots = mergeSlots(startAt, durationMinutes);
    return Object.entries(activeResources).every(([type, ids]) =>
      ids.some(isResourceFree.bind(null, slots, blocked, type)),
    );
  };

export const getFreeResources = (
  activeResources: Record<EResourceType, number[]>,
  slots: Date[],
  blocked: Set<string>,
) => {
  const result = {} as Record<EResourceType, number[]>;
  Object.entries(activeResources).forEach(([type, ids]) => {
    result[type as EResourceType] = ids.filter(isResourceFree.bind(null, slots, blocked, type));
  });
  return result;
};

export function pickByLowestLoad(
  candidates: Record<EResourceType, number[]>,
  reservations: ResourceReservation[],
  topK = TOP_K_RESOURCES,
) {
  const counts = {} as Record<EResourceType, Record<number, number>>;
  Object.entries(candidates).forEach(
    ([type, ids]) => (counts[type] = Object.fromEntries(ids.map((id) => [id, 0]))),
  );

  for (const { resourceType, resourceId } of reservations)
    if (counts[resourceType]?.[resourceId] !== undefined) counts[resourceType][resourceId] += 1;

  const lowestLoad = {} as Record<EResourceType, number[]>;
  const remaining = {} as Record<EResourceType, number[]>;
  for (const type of Object.values(EResourceType)) {
    const topKIds = Object.entries(counts[type] ?? {})
      .sort(([, a], [, b]) => a - b)
      .slice(0, topK)
      .map(([key]) => Number(key));
    lowestLoad[type] = shuffle(topKIds);
    remaining[type] = shuffle(candidates[type].filter((id) => !lowestLoad[type].includes(id)));
  }
  return { lowestLoad, remaining };
}
