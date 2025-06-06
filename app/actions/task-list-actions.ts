'use server'

import { createDependencyContainer } from '../../src/infrastructure/config/DependencyInjection';
import { revalidatePath } from 'next/cache';

// useActionState対応の標準化された戻り値型
export type ActionState = {
  success: boolean;
  error?: string;
  message?: string;
};

export async function createTaskListAction(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  try {
    const container = await createDependencyContainer();
    const taskListService = container.taskListApplicationService;
    
    await taskListService.createTaskList({
      name: formData.get('name') as string,
    });
    
    revalidatePath('/dashboard');
    return {
      success: true,
      message: 'タスクリストが正常に作成されました'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'タスクリストの作成に失敗しました'
    };
  }
}

export async function updateTaskListAction(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  try {
    const container = await createDependencyContainer();
    const taskListService = container.taskListApplicationService;
    
    const listId = formData.get('listId') as string;
    const newName = formData.get('name') as string;
    
    await taskListService.updateTaskListName(listId, newName);
    
    revalidatePath('/dashboard');
    return {
      success: true,
      message: 'タスクリスト名が正常に更新されました'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'タスクリスト名の更新に失敗しました'
    };
  }
}

export async function deleteTaskListAction(prevState: ActionState | null, listId: string): Promise<ActionState> {
  try {
    const container = await createDependencyContainer();
    const taskListService = container.taskListApplicationService;
    
    await taskListService.deleteTaskListWithTasks(listId);
    revalidatePath('/dashboard');
    return {
      success: true,
      message: 'タスクリストが削除されました'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'タスクリストの削除に失敗しました'
    };
  }
}