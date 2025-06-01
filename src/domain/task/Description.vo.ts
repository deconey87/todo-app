export class Description {
  readonly value: string;

  private static readonly MAX_LENGTH = 1000;

  constructor(value: string) {
    if (value === null || value === undefined) {
      throw new Error('Description cannot be null or undefined.');
    }
    if (value.length > Description.MAX_LENGTH) {
      throw new Error(`Description cannot be longer than ${Description.MAX_LENGTH} characters.`);
    }
    this.value = value;
  }

  equals(other: Description): boolean {
    return this.value === other.value;
  }
}