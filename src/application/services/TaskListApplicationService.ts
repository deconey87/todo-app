import { TaskListManagementPort } from '../ports/input/TaskListManagementPort';
import { TaskListRepositoryPort } from '../ports/output/TaskListRepositoryPort';
import { TaskRepositoryPort } from '../ports/output/TaskRepositoryPort';
import { CreateTaskListDto } from '../dto/CreateTaskListDto';
import { TaskListDto } from '../dto/TaskListDto';
import { TaskDto } from '../dto/TaskDto';
import { TaskDtoMapper } from '../dto/TaskDtoMapper';
import { TaskList } from '../../domain/taskList/TaskList';
import { ListName } from '../../domain/taskList/ListName.vo';
import { ListId } from '../../domain/shared/types';
import { TaskListNotFoundError, ValidationError, DuplicateTaskListNameError } from '../errors/ApplicationError';

export class TaskListApplicationService implements TaskListManagementPort {
  constructor(
    private taskListRepository: TaskListRepositoryPort,
    private taskRepository: TaskRepositoryPort
  ) {}

  async createTaskList(dto: CreateTaskListDto): Promise<TaskListDto> {
    // バリデーション
    if (!dto.name || dto.name.trim() === '') {
      throw new ValidationError('Task list name is required');
    }

    try {
      // 値オブジェクトの作成
      const listName = new ListName(dto.name.trim());
      
      // 重複チェック
      const existingList = await this.taskListRepository.findByName(listName);
      if (existingList) {
        throw new DuplicateTaskListNameError(dto.name);
      }

      // エンティティの作成
      const listId: ListId = await this.taskListRepository.nextId();
      const taskList = new TaskList(listId, listName);

      // 永続化
      await this.taskListRepository.save(taskList);

      // DTOに変換して返却
      return this.toDto(taskList);
    } catch (error) {
      if (error instanceof ValidationError || 
          error instanceof DuplicateTaskListNameError) {
        throw error;
      }
      // ドメインエラーをアプリケーションエラーに変換
      if (error instanceof Error) {
        throw new ValidationError(error.message);
      }
      throw new ValidationError('Failed to create task list');
    }
  }

  async getTaskList(id: string): Promise<TaskListDto | null> {
    const taskList = await this.taskListRepository.findById(id);
    return taskList ? this.toDto(taskList) : null;
  }

  async getAllTaskLists(): Promise<TaskListDto[]> {
    const taskLists = await this.taskListRepository.findAll();
    return taskLists.map(taskList => this.toDto(taskList));
  }

  async deleteTaskList(id: string): Promise<void> {
    const taskList = await this.taskListRepository.findById(id);
    if (!taskList) {
      throw new TaskListNotFoundError(id);
    }
    await this.taskListRepository.delete(id);
  }

  async getTasksByListId(listId: string): Promise<TaskDto[]> {
    // バリデーション
    if (!listId || listId.trim() === '') {
      throw new ValidationError('List ID is required');
    }

    try {
      // タスクリストの存在確認
      const taskList = await this.taskListRepository.findById(listId);
      if (!taskList) {
        throw new TaskListNotFoundError(listId);
      }

      // タスクを取得
      const tasks = await this.taskRepository.findByListId(listId);
      
      // DTOに変換して返却
      return tasks.map(task => TaskDtoMapper.toTaskDto(task));
    } catch (error) {
      if (error instanceof ValidationError ||
          error instanceof TaskListNotFoundError) {
        throw error;
      }
      throw new ValidationError('Failed to get tasks by list ID');
    }
  }

  async updateTaskListName(id: string, newName: string): Promise<TaskListDto> {
    // バリデーション
    if (!id || id.trim() === '') {
      throw new ValidationError('Task list ID is required');
    }
    if (!newName || newName.trim() === '') {
      throw new ValidationError('New task list name is required');
    }

    try {
      // タスクリストの存在確認
      const taskList = await this.taskListRepository.findById(id);
      if (!taskList) {
        throw new TaskListNotFoundError(id);
      }

      // 新しい名前の値オブジェクトを作成
      const newListName = new ListName(newName.trim());
      
      // 重複チェック（現在の名前と同じ場合は除外）
      if (taskList.name.value !== newListName.value) {
        const existingList = await this.taskListRepository.findByName(newListName);
        if (existingList) {
          throw new DuplicateTaskListNameError(newName);
        }
      }

      // ドメインエンティティで名前を変更
      taskList.changeName(newListName);

      // 永続化
      await this.taskListRepository.save(taskList);

      // DTOに変換して返却
      return this.toDto(taskList);
    } catch (error) {
      if (error instanceof ValidationError ||
          error instanceof TaskListNotFoundError ||
          error instanceof DuplicateTaskListNameError) {
        throw error;
      }
      // ドメインエラーをアプリケーションエラーに変換
      if (error instanceof Error) {
        throw new ValidationError(error.message);
      }
      throw new ValidationError('Failed to update task list name');
    }
  }

  async deleteTaskListWithTasks(id: string): Promise<void> {
    // バリデーション
    if (!id || id.trim() === '') {
      throw new ValidationError('Task list ID is required');
    }

    try {
      // タスクリストの存在確認
      const taskList = await this.taskListRepository.findById(id);
      if (!taskList) {
        throw new TaskListNotFoundError(id);
      }

      // 関連するタスクを削除（カスケード削除）
      await this.taskRepository.deleteByListId(id);

      // タスクリストを削除
      await this.taskListRepository.delete(id);
    } catch (error) {
      if (error instanceof ValidationError ||
          error instanceof TaskListNotFoundError) {
        throw error;
      }
      throw new ValidationError('Failed to delete task list with tasks');
    }
  }


  private toDto(taskList: TaskList): TaskListDto {
    return {
      id: taskList.id,
      name: taskList.name.value,
      createdAt: new Date().toISOString(), // 簡易実装：現在時刻を使用
      updatedAt: new Date().toISOString()  // 簡易実装：現在時刻を使用
    };
  }
}