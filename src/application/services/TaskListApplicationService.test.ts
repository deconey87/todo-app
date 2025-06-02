import { describe, it, expect, beforeEach } from 'vitest';
import { TaskListApplicationService } from './TaskListApplicationService';
import { InMemoryTaskListRepository } from '../../infrastructure/adapters/output/persistence/InMemoryTaskListRepository';
import { InMemoryTaskRepository } from '../../infrastructure/adapters/output/persistence/InMemoryTaskRepository';
import { TimeProvider } from '../ports/output/TimeProvider';
import { CreateTaskListDto } from '../dto/CreateTaskListDto';
import { ValidationError, DuplicateTaskListNameError, TaskListNotFoundError } from '../errors/ApplicationError';
import { Task } from '../../domain/task/Task';
import { Title } from '../../domain/task/Title.vo';
import { Description } from '../../domain/task/Description.vo';
import { Status, TaskStatusEnum } from '../../domain/task/Status.vo';
import { TaskId, ListId } from '../../domain/shared/types';

describe('TaskListApplicationService', () => {
  let service: TaskListApplicationService;
  let taskListRepository: InMemoryTaskListRepository;
  let taskRepository: InMemoryTaskRepository;
  let mockTimeProvider: TimeProvider;
  let fixedDate: Date;

  beforeEach(() => {
    taskListRepository = new InMemoryTaskListRepository();
    taskRepository = new InMemoryTaskRepository();
    
    // 固定時刻を設定（テストの一貫性のため）
    fixedDate = new Date('2024-06-02T10:00:00.000Z');
    mockTimeProvider = {
      now: () => fixedDate
    };
    
    service = new TaskListApplicationService(taskListRepository, taskRepository, mockTimeProvider);
  });

  describe('createTaskList', () => {
    it('should create a new task list successfully', async () => {
      const dto: CreateTaskListDto = {
        name: 'My First List'
      };

      const result = await service.createTaskList(dto);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe('My First List');
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(taskListRepository.size()).toBe(1);
    });

    it('should throw ValidationError for empty name', async () => {
      const dto: CreateTaskListDto = {
        name: ''
      };

      await expect(service.createTaskList(dto)).rejects.toThrow(ValidationError);
      expect(taskListRepository.size()).toBe(0);
    });

    it('should throw ValidationError for whitespace-only name', async () => {
      const dto: CreateTaskListDto = {
        name: '   '
      };

      await expect(service.createTaskList(dto)).rejects.toThrow(ValidationError);
      expect(taskListRepository.size()).toBe(0);
    });

    it('should throw DuplicateTaskListNameError for duplicate names', async () => {
      const dto: CreateTaskListDto = {
        name: 'Duplicate List'
      };

      await service.createTaskList(dto);
      
      await expect(service.createTaskList(dto)).rejects.toThrow(DuplicateTaskListNameError);
      expect(taskListRepository.size()).toBe(1);
    });

    it('should trim whitespace from name', async () => {
      const dto: CreateTaskListDto = {
        name: '  Trimmed List  '
      };

      const result = await service.createTaskList(dto);

      expect(result.name).toBe('Trimmed List');
    });
  });

  describe('getTaskList', () => {
    it('should return task list when it exists', async () => {
      const dto: CreateTaskListDto = {
        name: 'Test List'
      };

      const created = await service.createTaskList(dto);
      const result = await service.getTaskList(created.id);

      expect(result).toBeDefined();
      expect(result!.id).toBe(created.id);
      expect(result!.name).toBe('Test List');
    });

    it('should return null when task list does not exist', async () => {
      const result = await service.getTaskList('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('getAllTaskLists', () => {
    it('should return empty array when no task lists exist', async () => {
      const result = await service.getAllTaskLists();

      expect(result).toEqual([]);
    });

    it('should return all task lists', async () => {
      await service.createTaskList({ name: 'List 1' });
      await service.createTaskList({ name: 'List 2' });

      const result = await service.getAllTaskLists();

      expect(result).toHaveLength(2);
      expect(result.map(list => list.name)).toContain('List 1');
      expect(result.map(list => list.name)).toContain('List 2');
    });
  });

  describe('deleteTaskList', () => {
    it('should delete existing task list', async () => {
      const created = await service.createTaskList({ name: 'To Delete' });

      await service.deleteTaskList(created.id);

      const result = await service.getTaskList(created.id);
      expect(result).toBeNull();
      expect(taskListRepository.size()).toBe(0);
    });

    it('should throw TaskListNotFoundError for non-existent task list', async () => {
      await expect(service.deleteTaskList('non-existent-id')).rejects.toThrow(TaskListNotFoundError);
    });
  });

  describe('getTasksByListId', () => {
    let listId: string;

    beforeEach(async () => {
      const created = await service.createTaskList({ name: 'Test List' });
      listId = created.id;
    });

    it('should return empty array when no tasks exist in the list', async () => {
      const result = await service.getTasksByListId(listId);

      expect(result).toEqual([]);
    });

    it('should return tasks for the specified list', async () => {
      // タスクを直接リポジトリに追加
      const task1 = new Task(
        TaskId.create('task-1'),
        new Title('Task 1'),
        new Description('Description 1'),
        null,
        new Status(TaskStatusEnum.TODO),
        ListId.create(listId)
      );
      const task2 = new Task(
        TaskId.create('task-2'),
        new Title('Task 2'),
        new Description('Description 2'),
        null,
        new Status(TaskStatusEnum.IN_PROGRESS),
        ListId.create(listId)
      );

      await taskRepository.save(task1);
      await taskRepository.save(task2);

      const result = await service.getTasksByListId(listId);

      expect(result).toHaveLength(2);
      expect(result.map(task => task.title)).toContain('Task 1');
      expect(result.map(task => task.title)).toContain('Task 2');
      expect(result.map(task => task.listId)).toEqual([listId, listId]);
    });

    it('should throw ValidationError for empty list ID', async () => {
      await expect(service.getTasksByListId('')).rejects.toThrow(ValidationError);
    });

    it('should throw TaskListNotFoundError for non-existent list', async () => {
      await expect(service.getTasksByListId('non-existent-list')).rejects.toThrow(TaskListNotFoundError);
    });
  });

  describe('updateTaskListName (UC014)', () => {
    let listId: string;

    beforeEach(async () => {
      const created = await service.createTaskList({ name: 'Original Name' });
      listId = created.id;
    });

    it('should update task list name successfully', async () => {
      const result = await service.updateTaskListName(listId, 'Updated Name');

      expect(result.id).toBe(listId);
      expect(result.name).toBe('Updated Name');
      
      // 永続化されていることを確認
      const retrieved = await service.getTaskList(listId);
      expect(retrieved!.name).toBe('Updated Name');
    });

    it('should trim whitespace from new name', async () => {
      const result = await service.updateTaskListName(listId, '  Trimmed Name  ');

      expect(result.name).toBe('Trimmed Name');
    });

    it('should allow updating to the same name', async () => {
      const result = await service.updateTaskListName(listId, 'Original Name');

      expect(result.name).toBe('Original Name');
    });

    it('should throw ValidationError for empty ID', async () => {
      await expect(service.updateTaskListName('', 'New Name')).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for empty new name', async () => {
      await expect(service.updateTaskListName(listId, '')).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for whitespace-only new name', async () => {
      await expect(service.updateTaskListName(listId, '   ')).rejects.toThrow(ValidationError);
    });

    it('should throw TaskListNotFoundError for non-existent list', async () => {
      await expect(service.updateTaskListName('non-existent-id', 'New Name')).rejects.toThrow(TaskListNotFoundError);
    });

    it('should throw DuplicateTaskListNameError when new name already exists', async () => {
      await service.createTaskList({ name: 'Existing Name' });

      await expect(service.updateTaskListName(listId, 'Existing Name')).rejects.toThrow(DuplicateTaskListNameError);
    });
  });

  describe('deleteTaskListWithTasks (UC015)', () => {
    let listId: string;

    beforeEach(async () => {
      const created = await service.createTaskList({ name: 'List to Delete' });
      listId = created.id;
    });

    it('should delete task list without tasks', async () => {
      await service.deleteTaskListWithTasks(listId);

      const result = await service.getTaskList(listId);
      expect(result).toBeNull();
      expect(taskListRepository.size()).toBe(0);
    });

    it('should delete task list with related tasks (cascade delete)', async () => {
      // タスクを追加
      const task1 = new Task(
        TaskId.create('task-1'),
        new Title('Task 1'),
        new Description('Description 1'),
        null,
        new Status(TaskStatusEnum.TODO),
        ListId.create(listId)
      );
      const task2 = new Task(
        TaskId.create('task-2'),
        new Title('Task 2'),
        new Description('Description 2'),
        null,
        new Status(TaskStatusEnum.DONE),
        ListId.create(listId)
      );

      await taskRepository.save(task1);
      await taskRepository.save(task2);

      // 削除前の確認
      expect(taskRepository.size()).toBe(2);
      const tasksBeforeDelete = await service.getTasksByListId(listId);
      expect(tasksBeforeDelete).toHaveLength(2);

      // タスクリストと関連タスクを削除
      await service.deleteTaskListWithTasks(listId);

      // 削除後の確認
      const taskListResult = await service.getTaskList(listId);
      expect(taskListResult).toBeNull();
      expect(taskListRepository.size()).toBe(0);
      expect(taskRepository.size()).toBe(0);
    });

    it('should delete only tasks from the specified list', async () => {
      // 別のタスクリストを作成
      const anotherList = await service.createTaskList({ name: 'Another List' });
      
      // 両方のリストにタスクを追加
      const task1 = new Task(
        TaskId.create('task-1'),
        new Title('Task in first list'),
        new Description('Description 1'),
        null,
        new Status(TaskStatusEnum.TODO),
        ListId.create(listId)
      );
      const task2 = new Task(
        TaskId.create('task-2'),
        new Title('Task in second list'),
        new Description('Description 2'),
        null,
        new Status(TaskStatusEnum.TODO),
        ListId.create(anotherList.id)
      );

      await taskRepository.save(task1);
      await taskRepository.save(task2);

      // 最初のリストを削除
      await service.deleteTaskListWithTasks(listId);

      // 最初のリストとそのタスクが削除されていることを確認
      const firstListResult = await service.getTaskList(listId);
      expect(firstListResult).toBeNull();

      // 2番目のリストとそのタスクは残っていることを確認
      const secondListResult = await service.getTaskList(anotherList.id);
      expect(secondListResult).toBeDefined();
      expect(taskRepository.size()).toBe(1);
      
      const remainingTask = await taskRepository.findById(TaskId.create('task-2'));
      expect(remainingTask).toBeDefined();
      expect(remainingTask!.listId).toBe(anotherList.id);
    });

    it('should throw ValidationError for empty ID', async () => {
      await expect(service.deleteTaskListWithTasks('')).rejects.toThrow(ValidationError);
    });

    it('should throw TaskListNotFoundError for non-existent list', async () => {
      await expect(service.deleteTaskListWithTasks('non-existent-id')).rejects.toThrow(TaskListNotFoundError);
    });
  });
});