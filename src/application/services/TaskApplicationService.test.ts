import { TaskApplicationService } from './TaskApplicationService';
import { TaskRepositoryPort } from '../ports/output/TaskRepositoryPort';
import { TaskListRepositoryPort } from '../ports/output/TaskListRepositoryPort';
import { InMemoryTaskRepository } from '../../infrastructure/adapters/output/persistence/InMemoryTaskRepository';
import { InMemoryTaskListRepository } from '../../infrastructure/adapters/output/persistence/InMemoryTaskListRepository';
import { TaskList } from '../../domain/taskList/TaskList';
import { ListName } from '../../domain/taskList/ListName.vo';
import { CreateTaskDto } from '../dto/CreateTaskDto';
import { UpdateTaskDto } from '../dto/UpdateTaskDto';
import { TaskNotFoundError, TaskListNotFoundError, ValidationError } from '../errors/ApplicationError';

describe('TaskApplicationService', () => {
  let taskService: TaskApplicationService;
  let taskRepository: TaskRepositoryPort;
  let taskListRepository: TaskListRepositoryPort;
  let testListId: string;

  beforeEach(async () => {
    taskRepository = new InMemoryTaskRepository();
    taskListRepository = new InMemoryTaskListRepository();
    taskService = new TaskApplicationService(taskRepository, taskListRepository);

    // テスト用のタスクリストを作成
    const taskList = new TaskList('test-list-id', new ListName('テストリスト'));
    await taskListRepository.save(taskList);
    testListId = taskList.id;
  });

  describe('createTask', () => {
    it('正常にタスクを作成できる', async () => {
      const dto: CreateTaskDto = {
        title: 'テストタスク',
        description: 'テスト用のタスクです',
        listId: testListId
      };

      const result = await taskService.createTask(dto);

      expect(result.title).toBe('テストタスク');
      expect(result.description).toBe('テスト用のタスクです');
      expect(result.status).toBe('TODO');
      expect(result.listId).toBe(testListId);
      expect(result.dueDate).toBeNull();
      expect(result.id).toBeDefined();
    });

    it('期日付きのタスクを作成できる', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const dto: CreateTaskDto = {
        title: '期日付きタスク',
        description: '明日までのタスク',
        dueDate: tomorrow.toISOString(),
        status: 'IN_PROGRESS',
        listId: testListId
      };

      const result = await taskService.createTask(dto);

      expect(result.title).toBe('期日付きタスク');
      expect(result.status).toBe('IN_PROGRESS');
      expect(result.dueDate).toBe(tomorrow.toISOString());
    });

    it('タイトルが空の場合はエラーになる', async () => {
      const dto: CreateTaskDto = {
        title: '',
        listId: testListId
      };

      await expect(taskService.createTask(dto)).rejects.toThrow(ValidationError);
    });

    it('存在しないタスクリストIDの場合はエラーになる', async () => {
      const dto: CreateTaskDto = {
        title: 'テストタスク',
        listId: 'non-existent-list'
      };

      await expect(taskService.createTask(dto)).rejects.toThrow(TaskListNotFoundError);
    });
  });

  describe('updateTask', () => {
    let taskId: string;

    beforeEach(async () => {
      const dto: CreateTaskDto = {
        title: '更新前タスク',
        description: '更新前の説明',
        listId: testListId
      };
      const task = await taskService.createTask(dto);
      taskId = task.id;
    });

    it('タスクのタイトルを更新できる', async () => {
      const updateDto: UpdateTaskDto = {
        title: '更新後タスク'
      };

      const result = await taskService.updateTask(taskId, updateDto);

      expect(result.title).toBe('更新後タスク');
      expect(result.description).toBe('更新前の説明'); // 他のフィールドは変更されない
    });

    it('タスクのステータスを更新できる', async () => {
      const updateDto: UpdateTaskDto = {
        status: 'DONE'
      };

      const result = await taskService.updateTask(taskId, updateDto);

      expect(result.status).toBe('DONE');
    });

    it('存在しないタスクIDの場合はエラーになる', async () => {
      const updateDto: UpdateTaskDto = {
        title: '更新後タスク'
      };

      await expect(taskService.updateTask('non-existent-task', updateDto)).rejects.toThrow(TaskNotFoundError);
    });
  });

  describe('deleteTask', () => {
    it('タスクを削除できる', async () => {
      const dto: CreateTaskDto = {
        title: '削除対象タスク',
        listId: testListId
      };
      const task = await taskService.createTask(dto);

      await taskService.deleteTask(task.id);

      const deletedTask = await taskService.getTask(task.id);
      expect(deletedTask).toBeNull();
    });

    it('存在しないタスクIDの場合はエラーになる', async () => {
      await expect(taskService.deleteTask('non-existent-task')).rejects.toThrow(TaskNotFoundError);
    });
  });

  describe('getTasksByListId', () => {
    it('特定のタスクリストのタスク一覧を取得できる', async () => {
      // 複数のタスクを作成
      await taskService.createTask({ title: 'タスク1', listId: testListId });
      await taskService.createTask({ title: 'タスク2', listId: testListId });

      const tasks = await taskService.getTasksByListId(testListId);

      expect(tasks).toHaveLength(2);
      expect(tasks[0].title).toBe('タスク1');
      expect(tasks[1].title).toBe('タスク2');
    });
  });

  describe('changeTaskStatus', () => {
    let taskId: string;

    beforeEach(async () => {
      const dto: CreateTaskDto = {
        title: 'ステータス変更テスト',
        listId: testListId
      };
      const task = await taskService.createTask(dto);
      taskId = task.id;
    });

    it('タスクのステータスを変更できる', async () => {
      const result = await taskService.changeTaskStatus(taskId, 'DONE');

      expect(result.status).toBe('DONE');
    });

    it('存在しないタスクIDの場合はエラーになる', async () => {
      await expect(taskService.changeTaskStatus('non-existent-task', 'DONE')).rejects.toThrow(TaskNotFoundError);
    });
  });

  describe('getTasksByStatus', () => {
    beforeEach(async () => {
      // 異なるステータスのタスクを作成
      await taskService.createTask({ title: 'TODOタスク1', listId: testListId, status: 'TODO' });
      await taskService.createTask({ title: 'TODOタスク2', listId: testListId, status: 'TODO' });
      await taskService.createTask({ title: '進行中タスク', listId: testListId, status: 'IN_PROGRESS' });
      await taskService.createTask({ title: '完了タスク', listId: testListId, status: 'DONE' });
    });

    it('TODOステータスのタスクのみを取得できる', async () => {
      const tasks = await taskService.getTasksByStatus('TODO');

      expect(tasks).toHaveLength(2);
      expect(tasks.every(task => task.status === 'TODO')).toBe(true);
      expect(tasks.map(task => task.title)).toContain('TODOタスク1');
      expect(tasks.map(task => task.title)).toContain('TODOタスク2');
    });

    it('IN_PROGRESSステータスのタスクのみを取得できる', async () => {
      const tasks = await taskService.getTasksByStatus('IN_PROGRESS');

      expect(tasks).toHaveLength(1);
      expect(tasks[0].status).toBe('IN_PROGRESS');
      expect(tasks[0].title).toBe('進行中タスク');
    });

    it('DONEステータスのタスクのみを取得できる', async () => {
      const tasks = await taskService.getTasksByStatus('DONE');

      expect(tasks).toHaveLength(1);
      expect(tasks[0].status).toBe('DONE');
      expect(tasks[0].title).toBe('完了タスク');
    });

    it('無効なステータスの場合はエラーになる', async () => {
      await expect(taskService.getTasksByStatus('INVALID')).rejects.toThrow();
    });
  });

  describe('getTasksSortedByDueDate', () => {
    beforeEach(async () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const dayAfterTomorrow = new Date(today);
      dayAfterTomorrow.setDate(today.getDate() + 2);

      // 異なる期日のタスクを作成
      await taskService.createTask({
        title: '明日のタスク',
        listId: testListId,
        dueDate: tomorrow.toISOString()
      });
      await taskService.createTask({
        title: '明後日のタスク',
        listId: testListId,
        dueDate: dayAfterTomorrow.toISOString()
      });
      await taskService.createTask({
        title: '今日のタスク',
        listId: testListId,
        dueDate: today.toISOString()
      });
      await taskService.createTask({
        title: '期日なしタスク',
        listId: testListId
      });
    });

    it('期日の昇順でソートできる', async () => {
      const tasks = await taskService.getTasksSortedByDueDate(true);

      expect(tasks).toHaveLength(4);
      expect(tasks[0].title).toBe('今日のタスク');
      expect(tasks[1].title).toBe('明日のタスク');
      expect(tasks[2].title).toBe('明後日のタスク');
      expect(tasks[3].title).toBe('期日なしタスク'); // nullは最後
    });

    it('期日の降順でソートできる', async () => {
      const tasks = await taskService.getTasksSortedByDueDate(false);

      expect(tasks).toHaveLength(4);
      expect(tasks[0].title).toBe('明後日のタスク');
      expect(tasks[1].title).toBe('明日のタスク');
      expect(tasks[2].title).toBe('今日のタスク');
      expect(tasks[3].title).toBe('期日なしタスク'); // nullは最後
    });
  });

  describe('moveTaskToList', () => {
    let taskId: string;
    let anotherListId: string;

    beforeEach(async () => {
      // 移動元のタスクを作成
      const task = await taskService.createTask({
        title: '移動対象タスク',
        listId: testListId
      });
      taskId = task.id;

      // 移動先のタスクリストを作成
      const anotherList = new TaskList('another-list-id', new ListName('別のリスト'));
      await taskListRepository.save(anotherList);
      anotherListId = anotherList.id;
    });

    it('タスクを別のリストに移動できる', async () => {
      const result = await taskService.moveTaskToList(taskId, anotherListId);

      expect(result.listId).toBe(anotherListId);
      expect(result.title).toBe('移動対象タスク');

      // 移動後のタスクを確認
      const movedTask = await taskService.getTask(taskId);
      expect(movedTask?.listId).toBe(anotherListId);
    });

    it('同じリストへの移動は何もしない', async () => {
      const result = await taskService.moveTaskToList(taskId, testListId);

      expect(result.listId).toBe(testListId);
    });

    it('存在しないタスクIDの場合はエラーになる', async () => {
      await expect(taskService.moveTaskToList('non-existent-task', anotherListId))
        .rejects.toThrow(TaskNotFoundError);
    });

    it('存在しないタスクリストIDの場合はエラーになる', async () => {
      await expect(taskService.moveTaskToList(taskId, 'non-existent-list'))
        .rejects.toThrow(TaskListNotFoundError);
    });

    it('空のタスクIDの場合はエラーになる', async () => {
      await expect(taskService.moveTaskToList('', anotherListId))
        .rejects.toThrow(ValidationError);
    });

    it('空のリストIDの場合はエラーになる', async () => {
      await expect(taskService.moveTaskToList(taskId, ''))
        .rejects.toThrow(ValidationError);
    });
  });
});