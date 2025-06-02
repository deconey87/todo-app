import { TaskDto } from '../../dto/TaskDto';
import { CreateTaskDto } from '../../dto/CreateTaskDto';
import { UpdateTaskDto } from '../../dto/UpdateTaskDto';
import { TaskStatusLiteral } from '../../../shared/types/TaskStatus';

/**
 * Task管理の入力ポート
 * アプリケーションサービスが実装するインターフェース
 */
export interface TaskManagementPort {
  /**
   * 新しいタスクを作成する
   * @param dto タスク作成情報
   * @returns 作成されたタスク
   */
  createTask(dto: CreateTaskDto): Promise<TaskDto>;

  /**
   * タスクを更新する
   * @param id タスクID
   * @param dto 更新情報
   * @returns 更新されたタスク
   */
  updateTask(id: string, dto: UpdateTaskDto): Promise<TaskDto>;

  /**
   * タスクを削除する
   * @param id タスクID
   */
  deleteTask(id: string): Promise<void>;

  /**
   * 特定のタスクを取得する
   * @param id タスクID
   * @returns タスク（存在しない場合はnull）
   */
  getTask(id: string): Promise<TaskDto | null>;

  /**
   * 特定のタスクリストに属するタスク一覧を取得する
   * @param listId タスクリストID
   * @returns タスク一覧
   */
  getTasksByListId(listId: string): Promise<TaskDto[]>;

  /**
   * 全てのタスクを取得する
   * @returns 全タスク一覧
   */
  getAllTasks(): Promise<TaskDto[]>;

  /**
   * タスクのステータスを変更する
   * @param id タスクID
   * @param status 新しいステータス
   * @returns 更新されたタスク
   */
  changeTaskStatus(id: string, status: TaskStatusLiteral): Promise<TaskDto>;

  /**
   * 特定のステータスのタスクを取得する (UC008対応)
   * @param status フィルタリングするステータス
   * @returns 指定されたステータスのタスク一覧
   */
  getTasksByStatus(status: string): Promise<TaskDto[]>;

  /**
   * タスクを期日でソートして取得する (UC009対応)
   * @param ascending true: 昇順, false: 降順
   * @returns 期日でソートされたタスク一覧
   */
  getTasksSortedByDueDate(ascending: boolean): Promise<TaskDto[]>;

  /**
   * タスクを別のタスクリストに移動する (UC016対応)
   * @param taskId 移動するタスクのID
   * @param newListId 移動先のタスクリストID
   * @returns 更新されたタスク
   */
  moveTaskToList(taskId: string, newListId: string): Promise<TaskDto>;
}