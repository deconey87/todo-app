import { describe, it, expect, beforeEach } from 'vitest';
import { TaskListApplicationService } from './TaskListApplicationService';
import { InMemoryTaskListRepository } from '../../infrastructure/adapters/output/persistence/InMemoryTaskListRepository';
import { CreateTaskListDto } from '../dto/CreateTaskListDto';
import { ValidationError, DuplicateTaskListNameError, TaskListNotFoundError } from '../errors/ApplicationError';

describe('TaskListApplicationService', () => {
  let service: TaskListApplicationService;
  let repository: InMemoryTaskListRepository;

  beforeEach(() => {
    repository = new InMemoryTaskListRepository();
    service = new TaskListApplicationService(repository);
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
      expect(repository.size()).toBe(1);
    });

    it('should throw ValidationError for empty name', async () => {
      const dto: CreateTaskListDto = {
        name: ''
      };

      await expect(service.createTaskList(dto)).rejects.toThrow(ValidationError);
      expect(repository.size()).toBe(0);
    });

    it('should throw ValidationError for whitespace-only name', async () => {
      const dto: CreateTaskListDto = {
        name: '   '
      };

      await expect(service.createTaskList(dto)).rejects.toThrow(ValidationError);
      expect(repository.size()).toBe(0);
    });

    it('should throw DuplicateTaskListNameError for duplicate names', async () => {
      const dto: CreateTaskListDto = {
        name: 'Duplicate List'
      };

      await service.createTaskList(dto);
      
      await expect(service.createTaskList(dto)).rejects.toThrow(DuplicateTaskListNameError);
      expect(repository.size()).toBe(1);
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
      expect(repository.size()).toBe(0);
    });

    it('should throw TaskListNotFoundError for non-existent task list', async () => {
      await expect(service.deleteTaskList('non-existent-id')).rejects.toThrow(TaskListNotFoundError);
    });
  });
});