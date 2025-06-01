export class ListName {
  readonly value: string;

  private static readonly MAX_LENGTH = 100;

  constructor(value: string) {
    if (value === null || value === undefined) {
      throw new Error('ListName cannot be null or undefined.');
    }
    if (value.trim().length === 0) {
      throw new Error('ListName cannot be empty.');
    }
    if (value.length > ListName.MAX_LENGTH) {
      throw new Error(`ListName cannot be longer than ${ListName.MAX_LENGTH} characters.`);
    }
    this.value = value;
  }

  equals(other: ListName): boolean {
    return this.value === other.value;
  }
}