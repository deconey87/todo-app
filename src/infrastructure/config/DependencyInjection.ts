import { TaskListManagementPort } from '../../application/ports/input/TaskListManagementPort';
import { TaskManagementPort } from '../../application/ports/input/TaskManagementPort';
import { TaskListRepositoryPort } from '../../application/ports/output/TaskListRepositoryPort';
import { TaskRepositoryPort } from '../../application/ports/output/TaskRepositoryPort';
import { TimeProvider } from '../../application/ports/output/TimeProvider';
import { TaskListApplicationService } from '../../application/services/TaskListApplicationService';
import { TaskApplicationService } from '../../application/services/TaskApplicationService';
import { InMemoryTaskListRepository } from '../adapters/output/persistence/InMemoryTaskListRepository';
import { InMemoryTaskRepository } from '../adapters/output/persistence/InMemoryTaskRepository';
import { PostgreSQLTaskRepository } from '../adapters/output/persistence/PostgreSQLTaskRepository';
import { PostgreSQLTaskListRepository } from '../adapters/output/persistence/PostgreSQLTaskListRepository';
import { SystemTimeProvider } from '../adapters/output/time/SystemTimeProvider';
import { createDatabasePool } from './DatabaseConfig';

/**
 * 環境変数に基づいてリポジトリを作成する関数
 * USE_POSTGRESQL=trueの場合はPostgreSQLアダプターを使用
 * それ以外の場合はインメモリリポジトリを使用（デフォルト）
 */
export const createRepositories = () => {
  const usePostgreSQL = process.env.USE_POSTGRESQL === 'true';
  
  if (usePostgreSQL) {
    const pool = createDatabasePool();
    return {
      taskRepository: new PostgreSQLTaskRepository(pool),
      taskListRepository: new PostgreSQLTaskListRepository(pool),
    };
  } else {
    return {
      taskRepository: new InMemoryTaskRepository(),
      taskListRepository: new InMemoryTaskListRepository(),
    };
  }
};

export class DependencyContainer {
  private taskListRepository: TaskListRepositoryPort;
  private taskRepository: TaskRepositoryPort;
  private timeProvider: TimeProvider;
  private taskListService: TaskListManagementPort;
  private taskService: TaskManagementPort;

  public constructor() {
    // 環境変数に基づいてリポジトリを作成
    const repositories = createRepositories();
    this.taskListRepository = repositories.taskListRepository;
    this.taskRepository = repositories.taskRepository;
    this.timeProvider = new SystemTimeProvider();
    
    // サービスの初期化
    this.taskListService = new TaskListApplicationService(
      this.taskListRepository,
      this.taskRepository,
      this.timeProvider
    );
    this.taskService = new TaskApplicationService(
      this.taskRepository,
      this.taskListRepository,
      this.timeProvider
    );
  }

  getTaskListService(): TaskListManagementPort {
    return this.taskListService;
  }

  getTaskService(): TaskManagementPort {
    return this.taskService;
  }

  getTaskListRepository(): TaskListRepositoryPort {
    return this.taskListRepository;
  }

  getTaskRepository(): TaskRepositoryPort {
    return this.taskRepository;
  }

  getTimeProvider(): TimeProvider {
    return this.timeProvider;
  }

  get taskApplicationService(): TaskManagementPort {
    return this.taskService;
  }

  get taskListApplicationService(): TaskListManagementPort {
    return this.taskListService;
  }
}

export class DependencyContainerFactory {
  private static instance: DependencyContainer | null = null;
  private static isSeeded: boolean = false;

  static async create(): Promise<DependencyContainer> {
    if (!this.instance) {
      this.instance = new DependencyContainer();
      
      // 初回作成時にシードデータを作成
      if (!this.isSeeded) {
        await this.seedInitialData(this.instance);
        this.isSeeded = true;
      }
    }
    return this.instance;
  }

  private static async seedInitialData(container: DependencyContainer): Promise<void> {
    try {
      const taskListService = container.taskListApplicationService;
      const taskService = container.taskApplicationService;

      // テストタスクリストを作成
      const list1 = await taskListService.createTaskList({ name: '個人タスク' });
      const list2 = await taskListService.createTaskList({ name: '仕事' });
      const list3 = await taskListService.createTaskList({ name: '買い物' });

      // テストタスクを作成
      await taskService.createTask({
        title: 'プロジェクト企画書作成',
        description: '新しいプロジェクトの企画書を作成する',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        listId: list2.id,
      });

      const task2 = await taskService.createTask({
        title: '読書',
        description: 'TypeScriptの本を読む',
        dueDate: '',
        listId: list1.id,
      });

      await taskService.createTask({
        title: '牛乳を買う',
        description: '',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        listId: list3.id,
      });

      // タスクのステータスを変更
      await taskService.changeTaskStatus(task2.id, 'IN_PROGRESS');

      console.log('初期データを作成しました');
    } catch (error) {
      console.error('初期データの作成中にエラーが発生しました:', error);
    }
  }

  // テスト用のリセット機能
  static reset(): void {
    this.instance = null;
    this.isSeeded = false;
  }
}

export async function createDependencyContainer(): Promise<DependencyContainer> {
  return await DependencyContainerFactory.create();
}