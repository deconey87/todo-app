import { DueDate } from './DueDate.vo';

describe('DueDate Value Object', () => {
  // 固定時刻を使用してテストの安定性を向上
  const fixedTime = new Date('2024-06-02T10:00:00.000Z');
  const pastDate = new Date('2024-06-01T10:00:00.000Z');
  const futureDate = new Date('2024-06-03T10:00:00.000Z');
  const todayDate = new Date('2024-06-02T15:00:00.000Z'); // 同じ日の異なる時刻

  describe('create', () => {
    it('should create a DueDate instance with a valid future date', () => {
      const dueDate = DueDate.create(futureDate, fixedTime);
      expect(dueDate.value.toISOString().split('T')[0]).toBe(futureDate.toISOString().split('T')[0]);
    });

    it('should create a DueDate instance with today\'s date', () => {
      const dueDate = DueDate.create(todayDate, fixedTime);
      expect(dueDate.value.toISOString().split('T')[0]).toBe(todayDate.toISOString().split('T')[0]);
    });

    it('should throw an error if value is null', () => {
      // @ts-expect-error: Testing invalid input
      expect(() => DueDate.create(null, fixedTime)).toThrow('期日は現在時刻以降である必要があります');
    });

    it('should throw an error if value is undefined', () => {
      // @ts-expect-error: Testing invalid input
      expect(() => DueDate.create(undefined, fixedTime)).toThrow('期日は現在時刻以降である必要があります');
    });

    it('should throw an error if the date is in the past', () => {
      expect(() => DueDate.create(pastDate, fixedTime)).toThrow('期日は現在時刻以降である必要があります');
    });

    it('should use current time when currentTime is not provided', () => {
      // 未来の日付なので例外は発生しない
      const farFutureDate = new Date();
      farFutureDate.setFullYear(farFutureDate.getFullYear() + 1);
      expect(() => DueDate.create(farFutureDate)).not.toThrow();
    });
  });

  describe('equals', () => {
    it('should return true if two DueDate instances have the same date', () => {
      const dueDate1 = DueDate.create(futureDate, fixedTime);
      const dueDate2 = DueDate.create(new Date(futureDate.getTime()), fixedTime); // 同じ日付の新しいインスタンス
      expect(dueDate1.equals(dueDate2)).toBe(true);
    });

    it('should return false if two DueDate instances have different dates', () => {
      const anotherFutureDate = new Date('2024-06-04T10:00:00.000Z');
      const dueDate1 = DueDate.create(futureDate, fixedTime);
      const dueDate2 = DueDate.create(anotherFutureDate, fixedTime);
      expect(dueDate1.equals(dueDate2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return the date in YYYY-MM-DD format', () => {
      const testDate = new Date('2025-01-15T10:00:00.000Z');
      const dueDate = DueDate.create(testDate, fixedTime);
      expect(dueDate.toString()).toBe('2025-01-15');
    });
  });
});