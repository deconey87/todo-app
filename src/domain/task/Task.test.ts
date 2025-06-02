import { Task } from './Task';
import { Title } from './Title.vo';
import { Description } from './Description.vo';
import { DueDate } from './DueDate.vo';
import { Status, TaskStatusEnum } from './Status.vo';
import { TaskId, ListId } from '../shared/types';

describe('Task Entity', () => {
  const mockTaskId: TaskId = TaskId.create('task-123');
  const mockListId: ListId = ListId.create('list-abc');
  
  // 固定時刻を使用してテストの安定性を向上
  const fixedTime = new Date('2024-06-02T10:00:00.000Z');
  const futureDate = new Date('2024-06-03T10:00:00.000Z');
  const anotherFutureDate = new Date('2024-06-09T10:00:00.000Z'); // 1週間後

  describe('constructor', () => {
    it('should create a Task instance with valid properties', () => {
      const title = new Title('Test Task');
      const description = new Description('This is a test description.');
      const dueDate = DueDate.create(futureDate, fixedTime); // 明日の日付
      const status = new Status(TaskStatusEnum.TODO);

      const task = new Task(mockTaskId, title, description, dueDate, status, mockListId);

      expect(task.id).toBe(mockTaskId);
      expect(task.title.value).toBe('Test Task');
      expect(task.description.value).toBe('This is a test description.');
      expect(task.dueDate!.value.toISOString().split('T')[0]).toBe(dueDate.value.toISOString().split('T')[0]);
      expect(task.status.value).toBe(TaskStatusEnum.TODO);
      expect(task.listId).toBe(mockListId);
    });

    it('should create a Task instance with minimum valid properties (empty description)', () => {
      const title = new Title('Minimum Task');
      const description = new Description(''); // 空の説明
      const dueDate = DueDate.create(futureDate, fixedTime);
      const status = new Status(TaskStatusEnum.TODO);

      const task = new Task(mockTaskId, title, description, dueDate, status, mockListId);

      expect(task.id).toBe(mockTaskId);
      expect(task.title.value).toBe('Minimum Task');
      expect(task.description.value).toBe('');
      expect(task.dueDate!.value.toISOString().split('T')[0]).toBe(dueDate.value.toISOString().split('T')[0]);
      expect(task.status.value).toBe(TaskStatusEnum.TODO);
      expect(task.listId).toBe(mockListId);
    });

    it('should throw an error if listId is null or undefined', () => {
      const title = new Title('Test Task');
      const description = new Description('This is a test description.');
      const dueDate = DueDate.create(futureDate, fixedTime);
      const status = new Status(TaskStatusEnum.TODO);

      // @ts-expect-error: Testing invalid input
      expect(() => new Task(mockTaskId, title, description, dueDate, status, null)).toThrow('Task must belong to a list (listId is required).');
      // @ts-expect-error: Testing invalid input
      expect(() => new Task(mockTaskId, title, description, dueDate, status, undefined)).toThrow('Task must belong to a list (listId is required).');
    });
  });

  describe('changeTitle', () => {
    it('should change the title of the task', () => {
      const initialTitle = new Title('Initial Title');
      const description = new Description('Description');
      const dueDate = DueDate.create(futureDate, fixedTime);
      const status = new Status(TaskStatusEnum.TODO);
      const task = new Task(mockTaskId, initialTitle, description, dueDate, status, mockListId);

      const newTitle = new Title('New Title');
      task.changeTitle(newTitle);

      expect(task.title.value).toBe('New Title');
    });
  });

  describe('changeDescription', () => {
    it('should change the description of the task', () => {
      const title = new Title('Test Task');
      const initialDescription = new Description('Initial Description');
      const dueDate = DueDate.create(futureDate, fixedTime);
      const status = new Status(TaskStatusEnum.TODO);
      const task = new Task(mockTaskId, title, initialDescription, dueDate, status, mockListId);

      const newDescription = new Description('New Description');
      task.changeDescription(newDescription);

      expect(task.description.value).toBe('New Description');
    });

    it('should change the description to an empty string', () => {
      const title = new Title('Test Task');
      const initialDescription = new Description('Initial Description');
      const dueDate = DueDate.create(futureDate, fixedTime);
      const status = new Status(TaskStatusEnum.TODO);
      const task = new Task(mockTaskId, title, initialDescription, dueDate, status, mockListId);

      const newDescription = new Description('');
      task.changeDescription(newDescription);

      expect(task.description.value).toBe('');
    });
  });

  describe('changeDueDate', () => {
    it('should change the due date of the task to a future date', () => {
      const title = new Title('Test Task');
      const description = new Description('Description');
      const initialDueDate = DueDate.create(futureDate, fixedTime);
      const status = new Status(TaskStatusEnum.TODO);
      const task = new Task(mockTaskId, title, description, initialDueDate, status, mockListId);

      const newDueDate = DueDate.create(anotherFutureDate, fixedTime); // 1週間後の日付
      task.changeDueDate(newDueDate);

      expect(task.dueDate!.value.toISOString().split('T')[0]).toBe(newDueDate.value.toISOString().split('T')[0]);
    });
  });

  describe('changeStatus and status marking methods', () => {
    it('should change the status of the task', () => {
      const title = new Title('Test Task');
      const description = new Description('Description');
      const dueDate = DueDate.create(futureDate, fixedTime);
      const initialStatus = new Status(TaskStatusEnum.TODO);
      const task = new Task(mockTaskId, title, description, dueDate, initialStatus, mockListId);

      const newStatus = new Status(TaskStatusEnum.IN_PROGRESS);
      task.changeStatus(newStatus);
      expect(task.status.value).toBe(TaskStatusEnum.IN_PROGRESS);

      task.changeStatus(new Status(TaskStatusEnum.DONE));
      expect(task.status.value).toBe(TaskStatusEnum.DONE);
    });

    it('should mark the task as completed', () => {
      const title = new Title('Test Task');
      const description = new Description('Description');
      const dueDate = DueDate.create(futureDate, fixedTime);
      const status = new Status(TaskStatusEnum.TODO);
      const task = new Task(mockTaskId, title, description, dueDate, status, mockListId);

      task.markAsCompleted();
      expect(task.status.value).toBe(TaskStatusEnum.DONE);
    });

    it('should mark the task as in progress', () => {
      const title = new Title('Test Task');
      const description = new Description('Description');
      const dueDate = DueDate.create(futureDate, fixedTime);
      const status = new Status(TaskStatusEnum.TODO);
      const task = new Task(mockTaskId, title, description, dueDate, status, mockListId);

      task.markAsInProgress();
      expect(task.status.value).toBe(TaskStatusEnum.IN_PROGRESS);
    });

    it('should mark the task as todo', () => {
      const title = new Title('Test Task');
      const description = new Description('Description');
      const dueDate = DueDate.create(futureDate, fixedTime);
      const status = new Status(TaskStatusEnum.IN_PROGRESS);
      const task = new Task(mockTaskId, title, description, dueDate, status, mockListId);

      task.markAsTodo();
      expect(task.status.value).toBe(TaskStatusEnum.TODO);
    });
  });

  describe('equals', () => {
    it('should return true if tasks have the same ID', () => {
      const title = new Title('Test Task');
      const description = new Description('Description');
      const dueDate = DueDate.create(futureDate, fixedTime);
      const status = new Status(TaskStatusEnum.TODO);

      const task1 = new Task(mockTaskId, title, description, dueDate, status, mockListId);
      const task2 = new Task(mockTaskId, title, description, dueDate, status, mockListId); // 同じID

      expect(task1.equals(task2)).toBe(true);
    });

    it('should return false if tasks have different IDs', () => {
      const title = new Title('Test Task');
      const description = new Description('Description');
      const dueDate = DueDate.create(futureDate, fixedTime);
      const status = new Status(TaskStatusEnum.TODO);

      const task1 = new Task(TaskId.create('task-1'), title, description, dueDate, status, mockListId);
      const task2 = new Task(TaskId.create('task-2'), title, description, dueDate, status, mockListId); // 異なるID

      expect(task1.equals(task2)).toBe(false);
    });
  });

  describe('moveToList', () => {
    it('should move the task to a new list', () => {
      const title = new Title('Test Task');
      const description = new Description('Description');
      const dueDate = DueDate.create(futureDate, fixedTime);
      const status = new Status(TaskStatusEnum.TODO);
      const task = new Task(mockTaskId, title, description, dueDate, status, mockListId);

      const newListId: ListId = ListId.create('new-list-xyz');
      task.moveToList(newListId);

      expect(task.listId).toBe(newListId);
    });

    it('should throw an error if new listId is null or undefined', () => {
      const title = new Title('Test Task');
      const description = new Description('Description');
      const dueDate = DueDate.create(futureDate, fixedTime);
      const status = new Status(TaskStatusEnum.TODO);
      const task = new Task(mockTaskId, title, description, dueDate, status, mockListId);

      // @ts-expect-error: Testing invalid input
      expect(() => task.moveToList(null)).toThrow('Task must belong to a list (listId is required).');
      // @ts-expect-error: Testing invalid input
      expect(() => task.moveToList(undefined)).toThrow('Task must belong to a list (listId is required).');
    });

    it('should throw an error if new listId is empty string', () => {
      const title = new Title('Test Task');
      const description = new Description('Description');
      const dueDate = DueDate.create(futureDate, fixedTime);
      const status = new Status(TaskStatusEnum.TODO);
      const task = new Task(mockTaskId, title, description, dueDate, status, mockListId);

      expect(() => task.moveToList(ListId.create(''))).toThrow('Task must belong to a list (listId is required).');
    });
  });
});
