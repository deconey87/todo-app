import { TaskRepositoryPort } from '../../../../application/ports/output/TaskRepositoryPort';
import { Task } from '../../../../domain/task/Task';
import { TaskId, ListId } from '../../../../domain/shared/types';
import { Title } from '../../../../domain/task/Title.vo';
import { Description } from '../../../../domain/task/Description.vo';
import { DueDate } from '../../../../domain/task/DueDate.vo';
import { Status } from '../../../../domain/task/Status.vo';
import { v4 as uuidv4 } from 'uuid';

export class InMemoryTaskRepository implements TaskRepositoryPort {
  private tasks: Map<TaskId, Task> = new Map();

  async findById(taskId: TaskId): Promise<Task | null> {
    const task = this.tasks.get(taskId);
    return task ? this.cloneTask(task) : null;
  }

  async findByListId(listId: ListId): Promise<Task[]> {
    const tasks = Array.from(this.tasks.values())
      .filter(task => task.listId === listId);
    return tasks.map(task => this.cloneTask(task));
  }

  async findAll(): Promise<Task[]> {
    return Array.from(this.tasks.values()).map(task => this.cloneTask(task));
  }

  async save(task: Task): Promise<void> {
    this.tasks.set(task.id, this.cloneTask(task));
  }

  async delete(taskId: TaskId): Promise<void> {
    this.tasks.delete(taskId);
  }

  async deleteByListId(listId: ListId): Promise<void> {
    const tasksToDelete = Array.from(this.tasks.values())
      .filter(task => task.listId === listId);
    
    for (const task of tasksToDelete) {
      this.tasks.delete(task.id);
    }
  }

  async nextId(): Promise<TaskId> {
    return uuidv4();
  }

  // テスト用のヘルパーメソッド
  clear(): void {
    this.tasks.clear();
  }

  size(): number {
    return this.tasks.size;
  }

  private cloneTask(task: Task): Task {
    // 簡易的なクローン実装
    // 実際のプロジェクトでは、より堅牢なクローン機能が必要
    const clonedTitle = new Title(task.title.value);
    const clonedDescription = new Description(task.description.value);
    const clonedDueDate = task.dueDate ? new DueDate(new Date(task.dueDate.value)) : null;
    const clonedStatus = new Status(task.status.value);
    
    return new Task(
      task.id,
      clonedTitle,
      clonedDescription,
      clonedDueDate,
      clonedStatus,
      task.listId
    );
  }
}