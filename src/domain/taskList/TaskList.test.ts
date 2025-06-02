import { TaskList } from './TaskList';
import { ListName } from './ListName.vo';
import { ListId } from '../shared/types';

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
});
