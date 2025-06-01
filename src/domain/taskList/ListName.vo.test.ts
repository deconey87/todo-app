import { ListName } from './ListName.vo';

describe('ListName Value Object', () => {
  describe('constructor', () => {
    it('should create a ListName instance with a valid string', () => {
      const listName = new ListName('Valid List Name');
      expect(listName.value).toBe('Valid List Name');
    });

    it('should throw an error if value is null', () => {
      // @ts-expect-error: Testing invalid input
      expect(() => new ListName(null)).toThrow('ListName cannot be null or undefined.');
    });

    it('should throw an error if value is undefined', () => {
      // @ts-expect-error: Testing invalid input
      expect(() => new ListName(undefined)).toThrow('ListName cannot be null or undefined.');
    });

    it('should throw an error if value is an empty string', () => {
      expect(() => new ListName('')).toThrow('ListName cannot be empty.');
    });

    it('should throw an error if value is a whitespace-only string', () => {
      expect(() => new ListName('   ')).toThrow('ListName cannot be empty.');
    });

    it('should throw an error if value exceeds max length', () => {
      const longString = 'a'.repeat(101); // MAX_LENGTH + 1
      expect(() => new ListName(longString)).toThrow('ListName cannot be longer than 100 characters.');
    });
  });

  describe('equals', () => {
    it('should return true if two ListName instances have the same value', () => {
      const listName1 = new ListName('Same List Name');
      const listName2 = new ListName('Same List Name');
      expect(listName1.equals(listName2)).toBe(true);
    });

    it('should return false if two ListName instances have different values', () => {
      const listName1 = new ListName('List A');
      const listName2 = new ListName('List B');
      expect(listName1.equals(listName2)).toBe(false);
    });
  });
});