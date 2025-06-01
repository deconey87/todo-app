import { ListId, TaskId } from '../shared/types';
import { ListName } from './ListName.vo';
import { Task } from '../task/Task'; // Taskエンティティをインポート

export class TaskList {
  readonly id: ListId;
  private _name: ListName;
  private _tasks: Task[] = []; // Taskのコレクションを追加

  constructor(id: ListId, name: ListName) {
    this.id = id;
    this._name = name;
  }

  get name(): ListName {
    return this._name;
  }

  get tasks(): Task[] {
    return [...this._tasks]; // 外部からの変更を防ぐため、コピーを返す
  }

  changeName(newName: ListName): void {
    this._name = newName;
  }

  addTask(task: Task): void {
    if (this._tasks.some(t => t.equals(task))) {
      throw new Error(`Task with ID ${task.id} already exists in this list.`);
    }
    this._tasks.push(task);
  }

  removeTask(taskId: TaskId): void {
    const initialLength = this._tasks.length;
    this._tasks = this._tasks.filter(task => task.id !== taskId);
    if (this._tasks.length === initialLength) {
      throw new Error(`Task with ID ${taskId} not found in this list.`);
    }
  }

  getTaskById(taskId: TaskId): Task | undefined {
    return this._tasks.find(task => task.id === taskId);
  }

  // TaskListの同一性を判断
  equals(other: TaskList): boolean {
    return this.id === other.id;
  }
}