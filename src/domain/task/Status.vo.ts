export enum TaskStatusEnum {
  TODO = '未着手',
  IN_PROGRESS = '進行中',
  DONE = '完了',
}

export class Status {
  readonly value: TaskStatusEnum;

  constructor(value: TaskStatusEnum) {
    if (!Object.values(TaskStatusEnum).includes(value)) {
      throw new Error(`Invalid TaskStatus: ${value}`);
    }
    this.value = value;
  }

  equals(other: Status): boolean {
    return this.value === other.value;
  }
}