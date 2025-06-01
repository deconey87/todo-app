import { DueDate } from './DueDate.vo';

describe('DueDate Value Object', () => {
  describe('constructor', () => {
    it('should create a DueDate instance with a valid future date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1); // 明日の日付
      const dueDate = new DueDate(futureDate);
      expect(dueDate.value.toISOString().split('T')[0]).toBe(futureDate.toISOString().split('T')[0]);
    });

    it('should create a DueDate instance with today\'s date', () => {
      const today = new Date();
      const dueDate = new DueDate(today);
      expect(dueDate.value.toISOString().split('T')[0]).toBe(today.toISOString().split('T')[0]);
    });

    it('should throw an error if value is null', () => {
      // @ts-expect-error: Testing invalid input
      expect(() => new DueDate(null)).toThrow('DueDate cannot be null or undefined.');
    });

    it('should throw an error if value is undefined', () => {
      // @ts-expect-error: Testing invalid input
      expect(() => new DueDate(undefined)).toThrow('DueDate cannot be null or undefined.');
    });

    it('should throw an error if the date is in the past', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1); // 昨日の日付
      expect(() => new DueDate(pastDate)).toThrow('DueDate cannot be in the past.');
    });
  });

  describe('equals', () => {
    it('should return true if two DueDate instances have the same date', () => {
      const date1 = new Date();
      date1.setHours(0, 0, 0, 0);
      const dueDate1 = new DueDate(date1);
      const dueDate2 = new DueDate(new Date(date1.getTime())); // 同じ日付の新しいインスタンス
      expect(dueDate1.equals(dueDate2)).toBe(true);
    });

    it('should return false if two DueDate instances have different dates', () => {
      const date1 = new Date();
      date1.setHours(0, 0, 0, 0);
      const date2 = new Date();
      date2.setDate(date2.getDate() + 1);
      date2.setHours(0, 0, 0, 0);

      const dueDate1 = new DueDate(date1);
      const dueDate2 = new DueDate(date2);
      expect(dueDate1.equals(dueDate2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return the date in YYYY-MM-DD format', () => {
      const date = new Date();
      date.setFullYear(date.getFullYear() + 1); // 来年の日付
      date.setMonth(0); // 1月
      date.setDate(15); // 15日
      date.setHours(10, 0, 0, 0); // 時刻は任意
      const dueDate = new DueDate(date);
      expect(dueDate.toString()).toBe(`${date.getFullYear()}-01-15`);
    });
  });
});