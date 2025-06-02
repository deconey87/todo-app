/**
 * タスク作成用のデータ転送オブジェクト
 * 新しいタスクを作成する際に使用
 */
export interface CreateTaskDto {
  /** タスクタイトル（必須） */
  title: string;
  
  /** タスク説明（オプション、デフォルトは空文字） */
  description?: string;
  
  /** 期日（ISO 8601形式、オプション） */
  dueDate?: string;
  
  /** タスクステータス（オプション、デフォルトはTODO） */
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
  
  /** 所属タスクリストID（必須） */
  listId: string;
}