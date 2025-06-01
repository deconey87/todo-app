export class DueDate {
  readonly value: Date;

  constructor(value: Date) {
    if (value === null || value === undefined) {
      throw new Error('DueDate cannot be null or undefined.');
    }
    // 日付部分のみを比較するため、時刻情報をクリア
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDateOnly = new Date(value);
    dueDateOnly.setHours(0, 0, 0, 0);

    if (dueDateOnly < today) {
      throw new Error('DueDate cannot be in the past.');
    }
    this.value = value;
  }

  equals(other: DueDate): boolean {
    return this.value.getTime() === other.value.getTime();
  }

  toString(): string {
    return this.value.toISOString().split('T')[0]; // YYYY-MM-DD形式
  }
}