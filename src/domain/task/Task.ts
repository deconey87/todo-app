import { TaskId, ListId } from '../shared/types';
import { Title } from './Title.vo';
import { Description } from './Description.vo';
import { DueDate } from './DueDate.vo';
import { Status, TaskStatusEnum } from './Status.vo';

export class Task {
  readonly id: TaskId;
  private _title: Title;
  private _description: Description;
  private _dueDate: DueDate | null;
  private _status: Status;
  private _listId: ListId;

  constructor(
    id: TaskId,
    title: Title,
    description: Description,
    dueDate: DueDate | null,
    status: Status,
    listId: ListId,
  ) {
    if (!listId) {
      throw new Error('Task must belong to a list (listId is required).');
    }
    this.id = id;
    this._title = title;
    this._description = description;
    this._dueDate = dueDate;
    this._status = status;
    this._listId = listId;
  }

  get title(): Title {
    return this._title;
  }

  get description(): Description {
    return this._description;
  }

  get dueDate(): DueDate | null {
    return this._dueDate;
  }

  get status(): Status {
    return this._status;
  }

  get listId(): ListId {
    return this._listId;
  }

  changeTitle(newTitle: Title): void {
    this._title = newTitle;
  }

  changeDescription(newDescription: Description): void {
    this._description = newDescription;
  }

  changeDueDate(newDueDate: DueDate | null): void {
    this._dueDate = newDueDate;
  }

  changeStatus(newStatus: Status): void {
    this._status = newStatus;
  }

  markAsCompleted(): void {
    this._status = new Status(TaskStatusEnum.DONE);
  }

  markAsInProgress(): void {
    this._status = new Status(TaskStatusEnum.IN_PROGRESS);
  }

  markAsTodo(): void {
    this._status = new Status(TaskStatusEnum.TODO);
  }

  moveToList(newListId: ListId): void {
    if (!newListId) {
      throw new Error('Task must belong to a list (listId is required).');
    }
    this._listId = newListId;
  }

  // Taskの同一性を判断
  equals(other: Task): boolean {
    return this.id === other.id;
  }
}