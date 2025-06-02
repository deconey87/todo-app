import { TaskListManagementPort } from '../../application/ports/input/TaskListManagementPort';
import { TaskManagementPort } from '../../application/ports/input/TaskManagementPort';
import { TaskListRepositoryPort } from '../../application/ports/output/TaskListRepositoryPort';
import { TaskRepositoryPort } from '../../application/ports/output/TaskRepositoryPort';
import { TaskListApplicationService } from '../../application/services/TaskListApplicationService';
import { TaskApplicationService } from '../../application/services/TaskApplicationService';
import { InMemoryTaskListRepository } from '../adapters/output/persistence/InMemoryTaskListRepository';
import { InMemoryTaskRepository } from '../adapters/output/persistence/InMemoryTaskRepository';

export class DependencyContainer {
  private static instance: DependencyContainer;
  private taskListRepository: TaskListRepositoryPort;
  private taskRepository: TaskRepositoryPort;
  private taskListService: TaskListManagementPort;
  private taskService: TaskManagementPort;

  private constructor() {
    // リポジトリの初期化
    this.taskListRepository = new InMemoryTaskListRepository();
    this.taskRepository = new InMemoryTaskRepository();
    
    // サービスの初期化
    this.taskListService = new TaskListApplicationService(
      this.taskListRepository,
      this.taskRepository
    );
    this.taskService = new TaskApplicationService(
      this.taskRepository,
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

  getTaskService(): TaskManagementPort {
    return this.taskService;
  }

  getTaskListRepository(): TaskListRepositoryPort {
    return this.taskListRepository;
  }

  getTaskRepository(): TaskRepositoryPort {
    return this.taskRepository;
  }

  // テスト用のリセット機能
  static reset(): void {
    DependencyContainer.instance = new DependencyContainer();
  }
}