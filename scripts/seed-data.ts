import { createDependencyContainer } from '../src/infrastructure/config/DependencyInjection';

async function seedData() {
  const container = await createDependencyContainer();
  const taskListService = container.taskListApplicationService;
  const taskService = container.taskApplicationService;

  try {
    // テストタスクリストを作成
    const list1 = await taskListService.createTaskList({ name: '個人タスク' });
    const list2 = await taskListService.createTaskList({ name: '仕事' });
    const list3 = await taskListService.createTaskList({ name: '買い物' });

    console.log('タスクリストを作成しました:', { list1, list2, list3 });

    // テストタスクを作成
    const task1 = await taskService.createTask({
      title: 'プロジェクト企画書作成',
      description: '新しいプロジェクトの企画書を作成する',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1週間後
      listId: list2.id,
    });

    const task2 = await taskService.createTask({
      title: '読書',
      description: 'TypeScriptの本を読む',
      dueDate: '',
      listId: list1.id,
    });

    const task3 = await taskService.createTask({
      title: '牛乳を買う',
      description: '',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2日後
      listId: list3.id,
    });

    // タスクのステータスを変更
    await taskService.changeTaskStatus(task2.id, 'IN_PROGRESS');

    console.log('テストタスクを作成しました:', { task1, task2, task3 });
    console.log('シードデータの作成が完了しました！');

  } catch (error) {
    console.error('シードデータの作成中にエラーが発生しました:', error);
  }
}

seedData();