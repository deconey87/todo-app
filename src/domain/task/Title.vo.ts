export class Title {
  readonly value: string;

  private static readonly MAX_LENGTH = 255;

  constructor(value: string) {
    if (value === null || value === undefined) {
      throw new Error('Title cannot be null or undefined.');
    }
    if (value.trim().length === 0) {
      throw new Error('Title cannot be empty.');
    }
    if (value.length > Title.MAX_LENGTH) {
      throw new Error(`Title cannot be longer than ${Title.MAX_LENGTH} characters.`);
    }
    this.value = value;
  }

  equals(other: Title): boolean {
    return this.value === other.value;
  }
}