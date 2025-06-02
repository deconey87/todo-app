import { TaskStatusLiteral } from '../../shared/types/TaskStatus';

/**
 * タスク更新用のデータ転送オブジェクト
 * 既存のタスクを更新する際に使用
 */
export interface UpdateTaskDto {
  /** タスクタイトル（オプション） */
  title?: string;
  
  /** タスク説明（オプション） */
  description?: string;
  
  /** 期日（ISO 8601形式、オプション、nullで期日をクリア） */
  dueDate?: string | null;
  
  /** タスクステータス（オプション） */
  status?: TaskStatusLiteral;
  
  /** 所属タスクリストID（オプション、タスクの移動に使用） */
  listId?: string;
}