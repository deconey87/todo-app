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
 * USE_IN_MEMORY_DB=true の場合のみインメモリDB使用
 * それ以外はPostgreSQL使用
 */
export const createRepositories = () => {
  // シンプルな環境変数判定
  const useInMemoryDB = process.env.USE_IN_MEMORY_DB === 'true';

  if (useInMemoryDB) {
    return {
      taskRepository: new InMemoryTaskRepository(),
      taskListRepository: new InMemoryTaskListRepository(),
    };
  } else {
    const pool = createDatabasePool();
    return {
      taskRepository: new PostgreSQLTaskRepository(pool),
      taskListRepository: new PostgreSQLTaskListRepository(pool),
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

  static async create(): Promise<DependencyContainer> {
    if (!this.instance) {
      this.instance = new DependencyContainer();
    }
    return this.instance;
  }

  // テスト用のリセット機能
  static reset(): void {
    this.instance = null;
  }
}

export async function createDependencyContainer(): Promise<DependencyContainer> {
  return await DependencyContainerFactory.create();
}