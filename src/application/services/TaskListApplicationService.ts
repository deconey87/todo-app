import { TaskListManagementPort } from '../ports/input/TaskListManagementPort';
import { TaskListRepositoryPort } from '../ports/output/TaskListRepositoryPort';
import { CreateTaskListDto } from '../dto/CreateTaskListDto';
import { TaskListDto } from '../dto/TaskListDto';
import { TaskList } from '../../domain/taskList/TaskList';
import { ListName } from '../../domain/taskList/ListName.vo';
import { ListId } from '../../domain/shared/types';
import { TaskListNotFoundError, ValidationError, DuplicateTaskListNameError } from '../errors/ApplicationError';
import { v4 as uuidv4 } from 'uuid';

export class TaskListApplicationService implements TaskListManagementPort {
  constructor(
    private taskListRepository: TaskListRepositoryPort
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
      const listId: ListId = uuidv4();
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

  private toDto(taskList: TaskList): TaskListDto {
    return {
      id: taskList.id,
      name: taskList.name.value,
      createdAt: new Date().toISOString(), // 簡易実装：現在時刻を使用
      updatedAt: new Date().toISOString()  // 簡易実装：現在時刻を使用
    };
  }
}