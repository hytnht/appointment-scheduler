import { mergeSlots, isGridAligned } from '../appointment.helper';

describe('slot.util', () => {
  it('computes normal slots for 45-minute duration', () => {
    const startAt = new Date('2026-07-20T10:00:00.000Z');
    const slots = mergeSlots(startAt, 45);

    expect(slots).toHaveLength(3);
    expect(slots.map((slot) => slot.toISOString())).toEqual([
      '2026-07-20T10:00:00.000Z',
      '2026-07-20T10:15:00.000Z',
      '2026-07-20T10:30:00.000Z',
    ]);
  });

  it('returns one slot for a 15-minute duration', () => {
    const startAt = new Date('2026-07-20T10:00:00.000Z');
    const slots = mergeSlots(startAt, 15);

    expect(slots).toHaveLength(1);
    expect(slots[0].toISOString()).toBe('2026-07-20T10:00:00.000Z');
  });

  it('detects off-grid time', () => {
    const offGrid = new Date('2026-07-20T10:07:00.000Z');
    expect(isGridAligned(offGrid)).toBe(false);
  });

  it('keeps absolute anchor stable when dealership open time is off-grid', () => {
    const dealershipOpenAt = new Date('2026-07-20T09:07:00.000Z');
    const alignedStart = new Date('2026-07-20T10:15:00.000Z');

    expect(isGridAligned(dealershipOpenAt)).toBe(false);
    expect(isGridAligned(alignedStart)).toBe(true);
    expect(mergeSlots(alignedStart, 30).map((slot) => slot.toISOString())).toEqual([
      '2026-07-20T10:15:00.000Z',
      '2026-07-20T10:30:00.000Z',
    ]);
  });
});
