import { Title } from './Title.vo';

describe('Title Value Object', () => {
  describe('constructor', () => {
    it('should create a Title instance with a valid string', () => {
      const title = new Title('Valid Title');
      expect(title.value).toBe('Valid Title');
    });

    it('should throw an error if value is null', () => {
      // @ts-expect-error: Testing invalid input
      expect(() => new Title(null)).toThrow('Title cannot be null or undefined.');
    });

    it('should throw an error if value is undefined', () => {
      // @ts-expect-error: Testing invalid input
      expect(() => new Title(undefined)).toThrow('Title cannot be null or undefined.');
    });

    it('should throw an error if value is an empty string', () => {
      expect(() => new Title('')).toThrow('Title cannot be empty.');
    });

    it('should throw an error if value is a whitespace-only string', () => {
      expect(() => new Title('   ')).toThrow('Title cannot be empty.');
    });

    it('should throw an error if value exceeds max length', () => {
      const longString = 'a'.repeat(256); // MAX_LENGTH + 1
      expect(() => new Title(longString)).toThrow('Title cannot be longer than 255 characters.');
    });
  });

  describe('equals', () => {
    it('should return true if two Title instances have the same value', () => {
      const title1 = new Title('Same Title');
      const title2 = new Title('Same Title');
      expect(title1.equals(title2)).toBe(true);
    });

    it('should return false if two Title instances have different values', () => {
      const title1 = new Title('Title A');
      const title2 = new Title('Title B');
      expect(title1.equals(title2)).toBe(false);
    });
  });
});