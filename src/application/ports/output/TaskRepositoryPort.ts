import { Task } from '../../../domain/task/Task';
import { TaskId, ListId } from '../../../domain/shared/types';

/**
 * Task永続化の出力ポート
 * インフラストラクチャ層のリポジトリが実装するインターフェース
 */
export interface TaskRepositoryPort {
  /**
   * IDでタスクを検索する
   * @param taskId タスクID
   * @returns タスク（存在しない場合はnull）
   */
  findById(taskId: TaskId): Promise<Task | null>;

  /**
   * タスクリストIDでタスクを検索する
   * @param listId タスクリストID
   * @returns タスク一覧
   */
  findByListId(listId: ListId): Promise<Task[]>;

  /**
   * 全てのタスクを取得する
   * @returns 全タスク一覧
   */
  findAll(): Promise<Task[]>;

  /**
   * タスクを保存する（新規作成・更新両方）
   * @param task 保存するタスク
   */
  save(task: Task): Promise<void>;

  /**
   * タスクを削除する
   * @param taskId 削除するタスクのID
   */
  delete(taskId: TaskId): Promise<void>;

  /**
   * タスクリストIDに関連するすべてのタスクを削除する (UC015対応)
   * @param listId タスクリストID
   */
  deleteByListId(listId: ListId): Promise<void>;

  /**
   * 次のタスクIDを生成する
   * @returns 新しいタスクID
   */
  nextId(): Promise<TaskId>;
}