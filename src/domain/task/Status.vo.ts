import { TaskStatusEnum } from '../../shared/types/TaskStatus';

export { TaskStatusEnum } from '../../shared/types/TaskStatus';

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