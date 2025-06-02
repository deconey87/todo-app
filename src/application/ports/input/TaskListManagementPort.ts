import { CreateTaskListDto } from '../../dto/CreateTaskListDto';
import { TaskListDto } from '../../dto/TaskListDto';
import { TaskDto } from '../../dto/TaskDto';

export interface TaskListManagementPort {
  createTaskList(dto: CreateTaskListDto): Promise<TaskListDto>;
  getTaskList(id: string): Promise<TaskListDto | null>;
  getAllTaskLists(): Promise<TaskListDto[]>;
  deleteTaskList(id: string): Promise<void>;
  
  /**
   * 特定のタスクリスト内のタスク一覧を取得する (UC013対応)
   * @param listId タスクリストID
   * @returns タスク一覧
   */
  getTasksByListId(listId: string): Promise<TaskDto[]>;

  /**
   * タスクリストの名前を変更する (UC014対応)
   * @param id タスクリストID
   * @param newName 新しい名前
   * @returns 更新されたタスクリスト
   */
  updateTaskListName(id: string, newName: string): Promise<TaskListDto>;

  /**
   * タスクリストを削除する（関連タスクも削除） (UC015対応)
   * @param id タスクリストID
   */
  deleteTaskListWithTasks(id: string): Promise<void>;
}