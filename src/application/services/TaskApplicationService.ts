import { TaskManagementPort } from '../ports/input/TaskManagementPort';
import { TaskRepositoryPort } from '../ports/output/TaskRepositoryPort';
import { TaskListRepositoryPort } from '../ports/output/TaskListRepositoryPort';
import { CreateTaskDto } from '../dto/CreateTaskDto';
import { UpdateTaskDto } from '../dto/UpdateTaskDto';
import { TaskDto } from '../dto/TaskDto';
import { Task } from '../../domain/task/Task';
import { Title } from '../../domain/task/Title.vo';
import { Description } from '../../domain/task/Description.vo';
import { DueDate } from '../../domain/task/DueDate.vo';
import { Status, TaskStatusEnum } from '../../domain/task/Status.vo';
import { TaskId } from '../../domain/shared/types';
import { 
  TaskNotFoundError, 
  TaskListNotFoundError, 
  ValidationError, 
  InvalidTaskStatusError 
} from '../errors/ApplicationError';

export class TaskApplicationService implements TaskManagementPort {
  constructor(
    private taskRepository: TaskRepositoryPort,
    private taskListRepository: TaskListRepositoryPort
  ) {}

  async createTask(dto: CreateTaskDto): Promise<TaskDto> {
    // バリデーション
    if (!dto.title || dto.title.trim() === '') {
      throw new ValidationError('Task title is required');
    }
    if (!dto.listId || dto.listId.trim() === '') {
      throw new ValidationError('Task list ID is required');
    }

    try {
      // タスクリストの存在確認
      const taskList = await this.taskListRepository.findById(dto.listId);
      if (!taskList) {
        throw new TaskListNotFoundError(dto.listId);
      }

      // 値オブジェクトの作成
      const title = new Title(dto.title.trim());
      const description = new Description(dto.description?.trim() || '');
      const dueDate = dto.dueDate ? new DueDate(new Date(dto.dueDate)) : null;
      const status = dto.status ? this.mapToStatusEnum(dto.status) : TaskStatusEnum.TODO;
      const taskStatus = new Status(status);

      // エンティティの作成
      const taskId: TaskId = await this.taskRepository.nextId();
      const task = new Task(taskId, title, description, dueDate, taskStatus, dto.listId);

      // 永続化
      await this.taskRepository.save(task);

      // DTOに変換して返却
      return this.toDto(task);
    } catch (error) {
      if (error instanceof ValidationError || 
          error instanceof TaskListNotFoundError ||
          error instanceof InvalidTaskStatusError) {
        throw error;
      }
      // ドメインエラーをアプリケーションエラーに変換
      if (error instanceof Error) {
        throw new ValidationError(error.message);
      }
      throw new ValidationError('Failed to create task');
    }
  }

  async updateTask(id: string, dto: UpdateTaskDto): Promise<TaskDto> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new TaskNotFoundError(id);
    }

    try {
      // タスクリストの変更がある場合は存在確認
      if (dto.listId && dto.listId !== task.listId) {
        const taskList = await this.taskListRepository.findById(dto.listId);
        if (!taskList) {
          throw new TaskListNotFoundError(dto.listId);
        }
      }

      // 各フィールドの更新
      if (dto.title !== undefined) {
        if (!dto.title.trim()) {
          throw new ValidationError('Task title cannot be empty');
        }
        task.changeTitle(new Title(dto.title.trim()));
      }

      if (dto.description !== undefined) {
        task.changeDescription(new Description(dto.description.trim()));
      }

      if (dto.dueDate !== undefined) {
        const dueDate = dto.dueDate ? new DueDate(new Date(dto.dueDate)) : null;
        task.changeDueDate(dueDate);
      }

      if (dto.status !== undefined) {
        const statusEnum = this.mapToStatusEnum(dto.status);
        task.changeStatus(new Status(statusEnum));
      }

      // 永続化
      await this.taskRepository.save(task);

      // DTOに変換して返却
      return this.toDto(task);
    } catch (error) {
      if (error instanceof ValidationError || 
          error instanceof TaskListNotFoundError ||
          error instanceof InvalidTaskStatusError) {
        throw error;
      }
      // ドメインエラーをアプリケーションエラーに変換
      if (error instanceof Error) {
        throw new ValidationError(error.message);
      }
      throw new ValidationError('Failed to update task');
    }
  }

  async deleteTask(id: string): Promise<void> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new TaskNotFoundError(id);
    }
    await this.taskRepository.delete(id);
  }

  async getTask(id: string): Promise<TaskDto | null> {
    const task = await this.taskRepository.findById(id);
    return task ? this.toDto(task) : null;
  }

  async getTasksByListId(listId: string): Promise<TaskDto[]> {
    const tasks = await this.taskRepository.findByListId(listId);
    return tasks.map(task => this.toDto(task));
  }

  async getAllTasks(): Promise<TaskDto[]> {
    const tasks = await this.taskRepository.findAll();
    return tasks.map(task => this.toDto(task));
  }

  async changeTaskStatus(id: string, status: 'TODO' | 'IN_PROGRESS' | 'DONE'): Promise<TaskDto> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new TaskNotFoundError(id);
    }

    try {
      const statusEnum = this.mapToStatusEnum(status);
      task.changeStatus(new Status(statusEnum));
      
      // 永続化
      await this.taskRepository.save(task);

      // DTOに変換して返却
      return this.toDto(task);
    } catch (error) {
      if (error instanceof InvalidTaskStatusError) {
        throw error;
      }
      // ドメインエラーをアプリケーションエラーに変換
      if (error instanceof Error) {
        throw new ValidationError(error.message);
      }
      throw new ValidationError('Failed to change task status');
    }
  }

  async getTasksByStatus(status: string): Promise<TaskDto[]> {
    try {
      // ステータスの妥当性を確認
      const statusEnum = this.mapToStatusEnum(status as 'TODO' | 'IN_PROGRESS' | 'DONE');
      
      // 全タスクを取得してフィルタリング
      const allTasks = await this.taskRepository.findAll();
      const filteredTasks = allTasks.filter(task => task.status.value === statusEnum);
      
      return filteredTasks.map(task => this.toDto(task));
    } catch (error) {
      if (error instanceof InvalidTaskStatusError) {
        throw error;
      }
      throw new ValidationError('Failed to get tasks by status');
    }
  }

  async getTasksSortedByDueDate(ascending: boolean): Promise<TaskDto[]> {
    try {
      const allTasks = await this.taskRepository.findAll();
      
      // 期日でソート（nullの期日は最後に配置）
      const sortedTasks = allTasks.sort((a, b) => {
        const aDate = a.dueDate?.value;
        const bDate = b.dueDate?.value;
        
        // 両方nullの場合は順序を変更しない
        if (!aDate && !bDate) return 0;
        
        // 片方がnullの場合、nullを最後に配置
        if (!aDate) return 1;
        if (!bDate) return -1;
        
        // 両方に値がある場合は期日で比較
        const comparison = aDate.getTime() - bDate.getTime();
        return ascending ? comparison : -comparison;
      });
      
      return sortedTasks.map(task => this.toDto(task));
    } catch (error) {
      if (error instanceof Error) {
        throw new ValidationError(`Failed to get tasks sorted by due date: ${error.message}`);
      }
      throw new ValidationError('Failed to get tasks sorted by due date');
    }
  }

  async moveTaskToList(taskId: string, newListId: string): Promise<TaskDto> {
    // バリデーション
    if (!taskId || taskId.trim() === '') {
      throw new ValidationError('Task ID is required');
    }
    if (!newListId || newListId.trim() === '') {
      throw new ValidationError('New list ID is required');
    }

    try {
      // タスクの存在確認
      const task = await this.taskRepository.findById(taskId);
      if (!task) {
        throw new TaskNotFoundError(taskId);
      }

      // 移動先タスクリストの存在確認
      const targetList = await this.taskListRepository.findById(newListId);
      if (!targetList) {
        throw new TaskListNotFoundError(newListId);
      }

      // 同じリストへの移動は何もしない
      if (task.listId === newListId) {
        return this.toDto(task);
      }

      // タスクのリストIDを更新
      task.moveToList(newListId);
      
      // 永続化
      await this.taskRepository.save(task);

      // DTOに変換して返却
      return this.toDto(task);
    } catch (error) {
      if (error instanceof ValidationError ||
          error instanceof TaskNotFoundError ||
          error instanceof TaskListNotFoundError) {
        throw error;
      }
      // ドメインエラーをアプリケーションエラーに変換
      if (error instanceof Error) {
        throw new ValidationError(error.message);
      }
      throw new ValidationError('Failed to move task to list');
    }
  }

  private toDto(task: Task): TaskDto {
    return {
      id: task.id,
      title: task.title.value,
      description: task.description.value,
      dueDate: task.dueDate ? task.dueDate.value.toISOString() : null,
      status: this.mapFromStatusEnum(task.status.value),
      listId: task.listId,
      createdAt: new Date().toISOString(), // 簡易実装：現在時刻を使用
      updatedAt: new Date().toISOString()  // 簡易実装：現在時刻を使用
    };
  }

  private mapToStatusEnum(status: 'TODO' | 'IN_PROGRESS' | 'DONE'): TaskStatusEnum {
    switch (status) {
      case 'TODO':
        return TaskStatusEnum.TODO;
      case 'IN_PROGRESS':
        return TaskStatusEnum.IN_PROGRESS;
      case 'DONE':
        return TaskStatusEnum.DONE;
      default:
        throw new InvalidTaskStatusError(status);
    }
  }

  private mapFromStatusEnum(status: TaskStatusEnum): 'TODO' | 'IN_PROGRESS' | 'DONE' {
    switch (status) {
      case TaskStatusEnum.TODO:
        return 'TODO';
      case TaskStatusEnum.IN_PROGRESS:
        return 'IN_PROGRESS';
      case TaskStatusEnum.DONE:
        return 'DONE';
      default:
        throw new InvalidTaskStatusError(status);
    }
  }
}