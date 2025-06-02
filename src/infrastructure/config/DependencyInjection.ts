import { TaskListManagementPort } from '../../application/ports/input/TaskListManagementPort';
import { TaskManagementPort } from '../../application/ports/input/TaskManagementPort';
import { TaskListRepositoryPort } from '../../application/ports/output/TaskListRepositoryPort';
import { TaskRepositoryPort } from '../../application/ports/output/TaskRepositoryPort';
import { TimeProvider } from '../../application/ports/output/TimeProvider';
import { TaskListApplicationService } from '../../application/services/TaskListApplicationService';
import { TaskApplicationService } from '../../application/services/TaskApplicationService';
import { InMemoryTaskListRepository } from '../adapters/output/persistence/InMemoryTaskListRepository';
import { InMemoryTaskRepository } from '../adapters/output/persistence/InMemoryTaskRepository';
import { SystemTimeProvider } from '../adapters/output/time/SystemTimeProvider';

export class DependencyContainer {
  private taskListRepository: TaskListRepositoryPort;
  private taskRepository: TaskRepositoryPort;
  private timeProvider: TimeProvider;
  private taskListService: TaskListManagementPort;
  private taskService: TaskManagementPort;

  public constructor() {
    // リポジトリとプロバイダーの初期化
    this.taskListRepository = new InMemoryTaskListRepository();
    this.taskRepository = new InMemoryTaskRepository();
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

}

export class DependencyContainerFactory {
  static create(): DependencyContainer {
    return new DependencyContainer();
  }
}