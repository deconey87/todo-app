import { describe, it, expect } from 'vitest';
import { TaskDtoMapper } from './TaskDtoMapper';
import { Task } from '../../domain/task/Task';
import { Title } from '../../domain/task/Title.vo';
import { Description } from '../../domain/task/Description.vo';
import { DueDate } from '../../domain/task/DueDate.vo';
import { Status, TaskStatusEnum } from '../../domain/task/Status.vo';

describe('TaskDtoMapper', () => {
  describe('toTaskDto', () => {
    it('期日ありのタスクを正しくDTOに変換する', () => {
      // Arrange
      const taskId = 'task-1';
      const title = new Title('テストタスク');
      const description = new Description('テスト説明');
      const dueDate = new DueDate(new Date('2025-12-31T23:59:59.000Z'));
      const status = new Status(TaskStatusEnum.IN_PROGRESS);
      const listId = 'list-1';

      const task = new Task(taskId, title, description, dueDate, status, listId);

      // Act
      const dto = TaskDtoMapper.toTaskDto(task);

      // Assert
      expect(dto.id).toBe(taskId);
      expect(dto.title).toBe('テストタスク');
      expect(dto.description).toBe('テスト説明');
      expect(dto.dueDate).toBe('2025-12-31T23:59:59.000Z');
      expect(dto.status).toBe('IN_PROGRESS');
      expect(dto.listId).toBe(listId);
      expect(dto.createdAt).toBeDefined();
      expect(dto.updatedAt).toBeDefined();
    });

    it('期日なしのタスクを正しくDTOに変換する', () => {
      // Arrange
      const taskId = 'task-2';
      const title = new Title('期日なしタスク');
      const description = new Description('');
      const status = new Status(TaskStatusEnum.TODO);
      const listId = 'list-2';

      const task = new Task(taskId, title, description, null, status, listId);

      // Act
      const dto = TaskDtoMapper.toTaskDto(task);

      // Assert
      expect(dto.id).toBe(taskId);
      expect(dto.title).toBe('期日なしタスク');
      expect(dto.description).toBe('');
      expect(dto.dueDate).toBeNull();
      expect(dto.status).toBe('TODO');
      expect(dto.listId).toBe(listId);
      expect(dto.createdAt).toBeDefined();
      expect(dto.updatedAt).toBeDefined();
    });

    it('完了ステータスのタスクを正しくDTOに変換する', () => {
      // Arrange
      const taskId = 'task-3';
      const title = new Title('完了タスク');
      const description = new Description('完了したタスク');
      const status = new Status(TaskStatusEnum.DONE);
      const listId = 'list-3';

      const task = new Task(taskId, title, description, null, status, listId);

      // Act
      const dto = TaskDtoMapper.toTaskDto(task);

      // Assert
      expect(dto.status).toBe('DONE');
    });
  });

  describe('mapFromStatusEnum', () => {
    it('TODOステータスを正しく文字列に変換する', () => {
      // Act & Assert
      expect(TaskDtoMapper.mapFromStatusEnum(TaskStatusEnum.TODO)).toBe('TODO');
    });

    it('IN_PROGRESSステータスを正しく文字列に変換する', () => {
      // Act & Assert
      expect(TaskDtoMapper.mapFromStatusEnum(TaskStatusEnum.IN_PROGRESS)).toBe('IN_PROGRESS');
    });

    it('DONEステータスを正しく文字列に変換する', () => {
      // Act & Assert
      expect(TaskDtoMapper.mapFromStatusEnum(TaskStatusEnum.DONE)).toBe('DONE');
    });

    it('無効なステータスでエラーを投げる', () => {
      // Arrange
      const invalidStatus = 'INVALID' as unknown as TaskStatusEnum;

      // Act & Assert
      expect(() => TaskDtoMapper.mapFromStatusEnum(invalidStatus)).toThrow();
    });
  });
});