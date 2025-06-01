import { Description } from './Description.vo';

describe('Description Value Object', () => {
  describe('constructor', () => {
    it('should create a Description instance with a valid string', () => {
      const description = new Description('Valid Description');
      expect(description.value).toBe('Valid Description');
    });

    it('should create a Description instance with an empty string', () => {
      const description = new Description('');
      expect(description.value).toBe('');
    });

    it('should throw an error if value is null', () => {
      // @ts-expect-error: Testing invalid input
      expect(() => new Description(null)).toThrow('Description cannot be null or undefined.');
    });

    it('should throw an error if value is undefined', () => {
      // @ts-expect-error: Testing invalid input
      expect(() => new Description(undefined)).toThrow('Description cannot be null or undefined.');
    });

    it('should throw an error if value exceeds max length', () => {
      const longString = 'a'.repeat(1001); // MAX_LENGTH + 1
      expect(() => new Description(longString)).toThrow('Description cannot be longer than 1000 characters.');
    });
  });

  describe('equals', () => {
    it('should return true if two Description instances have the same value', () => {
      const desc1 = new Description('Same Description');
      const desc2 = new Description('Same Description');
      expect(desc1.equals(desc2)).toBe(true);
    });

    it('should return false if two Description instances have different values', () => {
      const desc1 = new Description('Description A');
      const desc2 = new Description('Description B');
      expect(desc1.equals(desc2)).toBe(false);
    });
  });
});