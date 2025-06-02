import { TaskStatusLiteral } from '../../shared/types/TaskStatus';

/**
 * タスクのデータ転送オブジェクト
 * アプリケーション層とプレゼンテーション層間でのデータ交換に使用
 */
export interface TaskDto {
  /** タスクID */
  id: string;
  
  /** タスクタイトル */
  title: string;
  
  /** タスク説明 */
  description: string;
  
  /** 期日（ISO 8601形式、未設定の場合はnull） */
  dueDate: string | null;
  
  /** タスクステータス */
  status: TaskStatusLiteral;
  
  /** 所属タスクリストID */
  listId: string;
  
  /** 作成日時（ISO 8601形式） */
  createdAt: string;
  
  /** 更新日時（ISO 8601形式） */
  updatedAt: string;
}