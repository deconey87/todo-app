import { Task } from '../../domain/task/Task';
import { TaskDto } from './TaskDto';
import { TaskStatusConverter } from '../../shared/types/TaskStatus';
import { TimeProvider } from '../ports/output/TimeProvider';

/**
 * TaskエンティティとTaskDTO間のマッピングを担当するクラス
 * 共通型定義を使用して変換処理を簡素化
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
      status: TaskStatusConverter.toLiteral(task.status.value),
      listId: task.listId,
      createdAt: currentTime,
      updatedAt: currentTime
    };
  }
}