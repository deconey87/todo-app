import { TaskManagementPort } from '../ports/input/TaskManagementPort';
import { TaskRepositoryPort } from '../ports/output/TaskRepositoryPort';
import { TaskListRepositoryPort } from '../ports/output/TaskListRepositoryPort';
import { TimeProvider } from '../ports/output/TimeProvider';
import { CreateTaskDto } from '../dto/CreateTaskDto';
import { UpdateTaskDto } from '../dto/UpdateTaskDto';
import { TaskDto } from '../dto/TaskDto';
import { TaskDtoMapper } from '../dto/TaskDtoMapper';
import { Task } from '../../domain/task/Task';
import { Title } from '../../domain/task/Title.vo';
import { Description } from '../../domain/task/Description.vo';
import { DueDate } from '../../domain/task/DueDate.vo';
import { Status, TaskStatusEnum } from '../../domain/task/Status.vo';
import { TaskId, ListId } from '../../domain/shared/types';
import {
  TaskNotFoundError,
  TaskListNotFoundError,
  ValidationError,
  InvalidTaskStatusError
} from '../errors/ApplicationError';

export class TaskApplicationService implements TaskManagementPort {
  constructor(
    private taskRepository: TaskRepositoryPort,
    private taskListRepository: TaskListRepositoryPort,
    private timeProvider: TimeProvider
  ) {}

  async createTask(dto: CreateTaskDto): Promise<TaskDto> {
    try {
      this.validateCreateTaskDto(dto);
      await this.ensureTaskListExists(dto.listId);
      const task = await this.buildTaskFromDto(dto);
      
      await this.taskRepository.save(task);
      return TaskDtoMapper.toTaskDto(task, this.timeProvider);
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

  /**
   * CreateTaskDtoのバリデーションを実行
   */
  private validateCreateTaskDto(dto: CreateTaskDto): void {
    if (!dto.title || dto.title.trim() === '') {
      throw new ValidationError('Task title is required');
    }
    if (!dto.listId || dto.listId.trim() === '') {
      throw new ValidationError('Task list ID is required');
    }
  }

  /**
   * タスクリストの存在確認
   */
  private async ensureTaskListExists(listId: string): Promise<void> {
    const taskList = await this.taskListRepository.findById(ListId.create(listId));
    if (!taskList) {
      throw new TaskListNotFoundError(listId);
    }
  }

  /**
   * DTOからTaskエンティティを構築
   */
  private async buildTaskFromDto(dto: CreateTaskDto): Promise<Task> {
    const title = new Title(dto.title.trim());
    const description = new Description(dto.description?.trim() || '');
    const dueDate = dto.dueDate ? DueDate.create(new Date(dto.dueDate), this.timeProvider.now()) : null;
    const status = dto.status ? this.mapToStatusEnum(dto.status) : TaskStatusEnum.TODO;
    const taskStatus = new Status(status);

    const taskId: TaskId = await this.taskRepository.nextId();
    return new Task(taskId, title, description, dueDate, taskStatus, ListId.create(dto.listId));
  }

  async updateTask(id: string, dto: UpdateTaskDto): Promise<TaskDto> {
    const task = await this.findExistingTask(id);

    try {
      this.validateUpdateTaskDto(dto);
      await this.updateTaskProperties(task, dto);
      
      await this.taskRepository.save(task);
      return TaskDtoMapper.toTaskDto(task, this.timeProvider);
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

  /**
   * UpdateTaskDtoのバリデーションを実行
   */
  private validateUpdateTaskDto(dto: UpdateTaskDto): void {
    if (dto.title !== undefined && !dto.title.trim()) {
      throw new ValidationError('Task title cannot be empty');
    }
  }

  /**
   * 既存タスクを取得
   */
  private async findExistingTask(taskId: string): Promise<Task> {
    const task = await this.taskRepository.findById(TaskId.create(taskId));
    if (!task) {
      throw new TaskNotFoundError(taskId);
    }
    return task;
  }

  /**
   * タスクプロパティの更新
   */
  private async updateTaskProperties(task: Task, dto: UpdateTaskDto): Promise<void> {
    // タスクリストの変更がある場合は存在確認
    if (dto.listId && dto.listId !== task.listId) {
      const taskList = await this.taskListRepository.findById(ListId.create(dto.listId));
      if (!taskList) {
        throw new TaskListNotFoundError(dto.listId);
      }
      task.moveToList(ListId.create(dto.listId));
    }

    // 各フィールドの更新
    if (dto.title !== undefined) {
      task.changeTitle(new Title(dto.title.trim()));
    }

    if (dto.description !== undefined) {
      task.changeDescription(new Description(dto.description.trim()));
    }

    if (dto.dueDate !== undefined) {
      const dueDate = dto.dueDate ? DueDate.create(new Date(dto.dueDate), this.timeProvider.now()) : null;
      task.changeDueDate(dueDate);
    }

    if (dto.status !== undefined) {
      const statusEnum = this.mapToStatusEnum(dto.status);
      task.changeStatus(new Status(statusEnum));
    }
  }

  async deleteTask(id: string): Promise<void> {
    const task = await this.taskRepository.findById(TaskId.create(id));
    if (!task) {
      throw new TaskNotFoundError(id);
    }
    await this.taskRepository.delete(TaskId.create(id));
  }

  async getTask(id: string): Promise<TaskDto | null> {
    const task = await this.taskRepository.findById(TaskId.create(id));
    return task ? TaskDtoMapper.toTaskDto(task, this.timeProvider) : null;
  }

  async getTasksByListId(listId: string): Promise<TaskDto[]> {
    const tasks = await this.taskRepository.findByListId(ListId.create(listId));
    return tasks.map(task => TaskDtoMapper.toTaskDto(task, this.timeProvider));
  }

  async getAllTasks(): Promise<TaskDto[]> {
    const tasks = await this.taskRepository.findAll();
    return tasks.map(task => TaskDtoMapper.toTaskDto(task, this.timeProvider));
  }

  async changeTaskStatus(id: string, status: 'TODO' | 'IN_PROGRESS' | 'DONE'): Promise<TaskDto> {
    const task = await this.taskRepository.findById(TaskId.create(id));
    if (!task) {
      throw new TaskNotFoundError(id);
    }

    try {
      const statusEnum = this.mapToStatusEnum(status);
      task.changeStatus(new Status(statusEnum));
      
      // 永続化
      await this.taskRepository.save(task);

      // DTOに変換して返却
      return TaskDtoMapper.toTaskDto(task, this.timeProvider);
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
      
      return filteredTasks.map(task => TaskDtoMapper.toTaskDto(task, this.timeProvider));
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
      
      return sortedTasks.map(task => TaskDtoMapper.toTaskDto(task, this.timeProvider));
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
      const task = await this.taskRepository.findById(TaskId.create(taskId));
      if (!task) {
        throw new TaskNotFoundError(taskId);
      }

      // 移動先タスクリストの存在確認
      const targetList = await this.taskListRepository.findById(ListId.create(newListId));
      if (!targetList) {
        throw new TaskListNotFoundError(newListId);
      }

      // 同じリストへの移動は何もしない
      if (task.listId === ListId.create(newListId)) {
        return TaskDtoMapper.toTaskDto(task, this.timeProvider);
      }

      // タスクのリストIDを更新
      task.moveToList(ListId.create(newListId));
      
      // 永続化
      await this.taskRepository.save(task);

      // DTOに変換して返却
      return TaskDtoMapper.toTaskDto(task, this.timeProvider);
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

}