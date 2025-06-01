import { ListId } from '../shared/types';
import { ListName } from './ListName.vo';

export class TaskList {
  readonly id: ListId;
  private _name: ListName;

  constructor(id: ListId, name: ListName) {
    this.id = id;
    this._name = name;
  }

  get name(): ListName {
    return this._name;
  }

  changeName(newName: ListName): void {
    this._name = newName;
  }

  // TaskListの同一性を判断
  equals(other: TaskList): boolean {
    return this.id === other.id;
  }
}