import { TaskList } from './TaskList';
import { ListName } from './ListName.vo';
import { ListId, TaskId } from '../shared/types';
import { Task } from '../task/Task';
import { Title } from '../task/Title.vo';
import { Description } from '../task/Description.vo';
import { DueDate } from '../task/DueDate.vo';
import { Status, TaskStatusEnum } from '../task/Status.vo';

describe('TaskList Entity', () => {
  const mockListId: ListId = 'list-abc';

  describe('constructor', () => {
    it('should create a TaskList instance with valid properties', () => {
      const listName = new ListName('My New List');
      const taskList = new TaskList(mockListId, listName);

      expect(taskList.id).toBe(mockListId);
      expect(taskList.name.value).toBe('My New List');
    });

    it('should throw an error if listName is invalid (e.g., empty)', () => {
      // ListNameのバリデーションはListName.vo.tsで行われるため、ここではListNameのコンストラクタがエラーをスローすることを確認
      expect(() => new ListName('')).toThrow('ListName cannot be empty.');
    });
  });

  describe('changeName', () => {
    it('should change the name of the task list', () => {
      const initialName = new ListName('Old List Name');
      const taskList = new TaskList(mockListId, initialName);

      const newName = new ListName('Updated List Name');
      taskList.changeName(newName);

      expect(taskList.name.value).toBe('Updated List Name');
    });

    it('should throw an error if the new name is invalid', () => {
      const initialName = new ListName('Valid Name');
      const taskList = new TaskList(mockListId, initialName);

      // ListNameのバリデーションはListName.vo.tsで行われるため、ここではListNameのコンストラクタがエラーをスローすることを確認
      expect(() => taskList.changeName(new ListName(''))).toThrow('ListName cannot be empty.');
    });
  });

  describe('equals', () => {
    it('should return true if task lists have the same ID', () => {
      const listName = new ListName('List 1');
      const taskList1 = new TaskList(mockListId, listName);
      const taskList2 = new TaskList(mockListId, listName); // 同じID

      expect(taskList1.equals(taskList2)).toBe(true);
    });

    it('should return false if task lists have different IDs', () => {
      const listName = new ListName('List 1');
      const taskList1 = new TaskList('list-1', listName);
      const taskList2 = new TaskList('list-2', listName); // 異なるID

      expect(taskList1.equals(taskList2)).toBe(false);
    });
  });

  describe('addTask', () => {
    let taskList: TaskList;
    let mockTask1: Task;
    let mockTask2: Task;

    beforeEach(() => {
      taskList = new TaskList(mockListId, new ListName('Test List'));
      mockTask1 = new Task('task-1', new Title('Task 1'), new Description(''), new DueDate(new Date(new Date().setDate(new Date().getDate() + 1))), new Status(TaskStatusEnum.TODO), mockListId);
      mockTask2 = new Task('task-2', new Title('Task 2'), new Description(''), new DueDate(new Date(new Date().setDate(new Date().getDate() + 2))), new Status(TaskStatusEnum.TODO), mockListId);
    });

    it('should add a task to the list', () => {
      taskList.addTask(mockTask1);
      expect(taskList.tasks).toHaveLength(1);
      expect(taskList.tasks[0].equals(mockTask1)).toBe(true);
    });

    it('should not add the same task twice', () => {
      taskList.addTask(mockTask1);
      expect(() => taskList.addTask(mockTask1)).toThrow(`Task with ID ${mockTask1.id} already exists in this list.`);
    });
  });

  describe('removeTask', () => {
    let taskList: TaskList;
    let mockTask1: Task;
    let mockTask2: Task;

    beforeEach(() => {
      taskList = new TaskList(mockListId, new ListName('Test List'));
      mockTask1 = new Task('task-1', new Title('Task 1'), new Description(''), new DueDate(new Date(new Date().setDate(new Date().getDate() + 1))), new Status(TaskStatusEnum.TODO), mockListId);
      mockTask2 = new Task('task-2', new Title('Task 2'), new Description(''), new DueDate(new Date(new Date().setDate(new Date().getDate() + 2))), new Status(TaskStatusEnum.TODO), mockListId);
      taskList.addTask(mockTask1);
      taskList.addTask(mockTask2);
    });

    it('should remove a task from the list by ID', () => {
      taskList.removeTask(mockTask1.id);
      expect(taskList.tasks).toHaveLength(1);
      expect(taskList.tasks[0].equals(mockTask2)).toBe(true);
    });

    it('should throw an error if task to remove is not found', () => {
      expect(() => taskList.removeTask('non-existent-task')).toThrow('Task with ID non-existent-task not found in this list.');
    });
  });

  describe('getTaskById', () => {
    let taskList: TaskList;
    let mockTask1: Task;
    let mockTask2: Task;

    beforeEach(() => {
      taskList = new TaskList(mockListId, new ListName('Test List'));
      mockTask1 = new Task('task-1', new Title('Task 1'), new Description(''), new DueDate(new Date(new Date().setDate(new Date().getDate() + 1))), new Status(TaskStatusEnum.TODO), mockListId);
      mockTask2 = new Task('task-2', new Title('Task 2'), new Description(''), new DueDate(new Date(new Date().setDate(new Date().getDate() + 2))), new Status(TaskStatusEnum.TODO), mockListId);
      taskList.addTask(mockTask1);
      taskList.addTask(mockTask2);
    });

    it('should return the task if found by ID', () => {
      const foundTask = taskList.getTaskById(mockTask1.id);
      expect(foundTask).toBeDefined();
      expect(foundTask?.equals(mockTask1)).toBe(true);
    });

    it('should return undefined if task is not found by ID', () => {
      const foundTask = taskList.getTaskById('non-existent-task');
      expect(foundTask).toBeUndefined();
    });
  });

  describe('tasks getter', () => {
    let taskList: TaskList;
    let mockTask1: Task;

    beforeEach(() => {
      taskList = new TaskList(mockListId, new ListName('Test List'));
      mockTask1 = new Task('task-1', new Title('Task 1'), new Description(''), new DueDate(new Date(new Date().setDate(new Date().getDate() + 1))), new Status(TaskStatusEnum.TODO), mockListId);
      taskList.addTask(mockTask1);
    });

    it('should return a copy of the tasks array', () => {
      const tasks = taskList.tasks;
      expect(tasks).toHaveLength(1);
      expect(tasks[0].equals(mockTask1)).toBe(true);

      // 外部から配列が変更されないことを確認
      tasks.push(new Task('task-3', new Title('Task 3'), new Description(''), new DueDate(new Date(new Date().setDate(new Date().getDate() + 3))), new Status(TaskStatusEnum.TODO), mockListId));
      expect(taskList.tasks).toHaveLength(1); // 元のリストは変更されていない
    });
  });
});
