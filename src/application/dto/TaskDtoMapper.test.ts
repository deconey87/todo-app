import { describe, it, expect, beforeEach } from 'vitest';
import { TaskDtoMapper } from './TaskDtoMapper';
import { TimeProvider } from '../ports/output/TimeProvider';
import { Task } from '../../domain/task/Task';
import { Title } from '../../domain/task/Title.vo';
import { Description } from '../../domain/task/Description.vo';
import { DueDate } from '../../domain/task/DueDate.vo';
import { Status, TaskStatusEnum } from '../../domain/task/Status.vo';
import { TaskId, ListId } from '../../domain/shared/types';
import { TaskStatusConverter } from '../../shared/types/TaskStatus';

describe('TaskDtoMapper', () => {
  let mockTimeProvider: TimeProvider;
  let fixedDate: Date;

  beforeEach(() => {
    // 固定時刻を設定（テストの一貫性のため）
    fixedDate = new Date('2024-06-02T10:00:00.000Z');
    mockTimeProvider = {
      now: () => fixedDate
    };
  });

  describe('toTaskDto', () => {
    it('期日ありのタスクを正しくDTOに変換する', () => {
      // Arrange
      const taskId = 'task-1';
      const title = new Title('テストタスク');
      const description = new Description('テスト説明');
      const dueDate = DueDate.create(new Date('2025-12-31T23:59:59.000Z'), fixedDate);
      const status = new Status(TaskStatusEnum.IN_PROGRESS);
      const listId = 'list-1';

      const task = new Task(TaskId.create(taskId), title, description, dueDate, status, ListId.create(listId));

      // Act
      const dto = TaskDtoMapper.toTaskDto(task, mockTimeProvider);

      // Assert
      expect(dto.id).toBe(taskId);
      expect(dto.title).toBe('テストタスク');
      expect(dto.description).toBe('テスト説明');
      expect(dto.dueDate).toBe('2025-12-31T23:59:59.000Z');
      expect(dto.status).toBe('IN_PROGRESS');
      expect(dto.listId).toBe(listId);
      expect(dto.createdAt).toBe('2024-06-02T10:00:00.000Z');
      expect(dto.updatedAt).toBe('2024-06-02T10:00:00.000Z');
    });

    it('期日なしのタスクを正しくDTOに変換する', () => {
      // Arrange
      const taskId = 'task-2';
      const title = new Title('期日なしタスク');
      const description = new Description('');
      const status = new Status(TaskStatusEnum.TODO);
      const listId = 'list-2';

      const task = new Task(TaskId.create(taskId), title, description, null, status, ListId.create(listId));

      // Act
      const dto = TaskDtoMapper.toTaskDto(task, mockTimeProvider);

      // Assert
      expect(dto.id).toBe(taskId);
      expect(dto.title).toBe('期日なしタスク');
      expect(dto.description).toBe('');
      expect(dto.dueDate).toBeNull();
      expect(dto.status).toBe('TODO');
      expect(dto.listId).toBe(listId);
      expect(dto.createdAt).toBe('2024-06-02T10:00:00.000Z');
      expect(dto.updatedAt).toBe('2024-06-02T10:00:00.000Z');
    });

    it('完了ステータスのタスクを正しくDTOに変換する', () => {
      // Arrange
      const taskId = 'task-3';
      const title = new Title('完了タスク');
      const description = new Description('完了したタスク');
      const status = new Status(TaskStatusEnum.DONE);
      const listId = 'list-3';

      const task = new Task(TaskId.create(taskId), title, description, null, status, ListId.create(listId));

      // Act
      const dto = TaskDtoMapper.toTaskDto(task, mockTimeProvider);

      // Assert
      expect(dto.status).toBe('DONE');
      expect(dto.createdAt).toBe('2024-06-02T10:00:00.000Z');
      expect(dto.updatedAt).toBe('2024-06-02T10:00:00.000Z');
    });

    it('TimeProviderから取得した時刻を使用する', () => {
      // Arrange
      const customDate = new Date('2023-01-01T12:00:00.000Z');
      const customTimeProvider: TimeProvider = {
        now: () => customDate
      };

      const task = new Task(
        TaskId.create('task-4'),
        new Title('時刻テスト'),
        new Description(''),
        null,
        new Status(TaskStatusEnum.TODO),
        ListId.create('list-4')
      );

      // Act
      const dto = TaskDtoMapper.toTaskDto(task, customTimeProvider);

      // Assert
      expect(dto.createdAt).toBe('2023-01-01T12:00:00.000Z');
      expect(dto.updatedAt).toBe('2023-01-01T12:00:00.000Z');
    });
  });

  describe('TaskStatusConverter統合テスト', () => {
    it('TODOステータスを正しく文字列に変換する', () => {
      // Act & Assert
      expect(TaskStatusConverter.toLiteral(TaskStatusEnum.TODO)).toBe('TODO');
    });

    it('IN_PROGRESSステータスを正しく文字列に変換する', () => {
      // Act & Assert
      expect(TaskStatusConverter.toLiteral(TaskStatusEnum.IN_PROGRESS)).toBe('IN_PROGRESS');
    });

    it('DONEステータスを正しく文字列に変換する', () => {
      // Act & Assert
      expect(TaskStatusConverter.toLiteral(TaskStatusEnum.DONE)).toBe('DONE');
    });

    it('無効なステータスでエラーを投げる', () => {
      // Arrange
      const invalidStatus = 'INVALID' as unknown as TaskStatusEnum;

      // Act & Assert
      expect(() => TaskStatusConverter.toLiteral(invalidStatus)).toThrow();
    });
  });
});