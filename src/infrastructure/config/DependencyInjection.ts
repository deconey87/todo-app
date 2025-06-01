import { TaskListManagementPort } from '../../application/ports/input/TaskListManagementPort';
import { TaskListRepositoryPort } from '../../application/ports/output/TaskListRepositoryPort';
import { TaskListApplicationService } from '../../application/services/TaskListApplicationService';
import { InMemoryTaskListRepository } from '../adapters/output/persistence/InMemoryTaskListRepository';

export class DependencyContainer {
  private static instance: DependencyContainer;
  private taskListRepository: TaskListRepositoryPort;
  private taskListService: TaskListManagementPort;

  private constructor() {
    // リポジトリの初期化
    this.taskListRepository = new InMemoryTaskListRepository();
    
    // サービスの初期化
    this.taskListService = new TaskListApplicationService(
      this.taskListRepository
    );
  }

  static getInstance(): DependencyContainer {
    if (!DependencyContainer.instance) {
      DependencyContainer.instance = new DependencyContainer();
    }
    return DependencyContainer.instance;
  }

  getTaskListService(): TaskListManagementPort {
    return this.taskListService;
  }

  getTaskListRepository(): TaskListRepositoryPort {
    return this.taskListRepository;
  }

  // テスト用のリセット機能
  static reset(): void {
    DependencyContainer.instance = new DependencyContainer();
  }
}