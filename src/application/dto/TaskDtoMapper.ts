import { Task } from '../../domain/task/Task';
import { TaskDto } from './TaskDto';
import { TaskStatusEnum } from '../../domain/task/Status.vo';
import { InvalidTaskStatusError } from '../errors/ApplicationError';
import { TimeProvider } from '../ports/output/TimeProvider';

/**
 * TaskエンティティとTaskDTO間のマッピングを担当するクラス
 * DRY原則に従い、重複するマッピングロジックを一元化
 */
export class TaskDtoMapper {
  /**
   * TaskエンティティをTaskDTOに変換
   * @param task Taskエンティティ
   * @param timeProvider 時刻提供者
   * @returns TaskDTO
   */
  static toTaskDto(task: Task, timeProvider: TimeProvider): TaskDto {
    const currentTime = timeProvider.now().toISOString();
    
    return {
      id: task.id,
      title: task.title.value,
      description: task.description.value,
      dueDate: task.dueDate ? task.dueDate.value.toISOString() : null,
      status: this.mapFromStatusEnum(task.status.value),
      listId: task.listId,
      createdAt: currentTime,
      updatedAt: currentTime
    };
  }

  /**
   * TaskStatusEnumを文字列ステータスに変換
   * @param status TaskStatusEnum
   * @returns ステータス文字列
   */
  static mapFromStatusEnum(status: TaskStatusEnum): 'TODO' | 'IN_PROGRESS' | 'DONE' {
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