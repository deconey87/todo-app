export class DueDate {
  readonly value: Date;

  private constructor(value: Date) {
    this.value = value;
  }

  static create(value: Date, currentTime?: Date): DueDate {
    if (value === null || value === undefined) {
      throw new Error('期日は現在時刻以降である必要があります');
    }
    
    // 現在時刻の取得（テスト時は注入された時刻を使用）
    const now = currentTime || new Date();
    
    // 日付部分のみを比較するため、時刻情報をクリア
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const dueDateOnly = new Date(value);
    dueDateOnly.setHours(0, 0, 0, 0);

    if (dueDateOnly < today) {
      throw new Error('期日は現在時刻以降である必要があります');
    }
    
    return new DueDate(value);
  }

  equals(other: DueDate): boolean {
    return this.value.getTime() === other.value.getTime();
  }

  toString(): string {
    return this.value.toISOString().split('T')[0]; // YYYY-MM-DD形式
  }
}