'use server'

import { createDependencyContainer } from '../../src/infrastructure/config/DependencyInjection';
import { revalidatePath } from 'next/cache';
import { TaskStatusLiteral } from '../../src/shared/types/TaskStatus';

// useActionState対応の標準化された戻り値型
export type ActionState = {
  success: boolean;
  error?: string;
  message?: string;
};

export async function createTaskAction(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  try {
    const container = await createDependencyContainer();
    const taskService = container.taskApplicationService;
    
    await taskService.createTask({
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      dueDate: formData.get('dueDate') as string,
      listId: formData.get('listId') as string,
    });
    
    revalidatePath('/dashboard');
    return {
      success: true,
      message: 'タスクが正常に作成されました'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'タスクの作成に失敗しました'
    };
  }
}

export async function updateTaskStatusAction(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  try {
    const container = await createDependencyContainer();
    const taskService = container.taskApplicationService;
    
    const taskId = formData.get('taskId') as string;
    const status = formData.get('status') as string;
    
    await taskService.changeTaskStatus(taskId, status as TaskStatusLiteral);
    revalidatePath('/dashboard');
    return {
      success: true,
      message: 'タスクステータスが更新されました'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'ステータスの更新に失敗しました'
    };
  }
}

// 通常のform action用のステータス更新関数
export async function updateTaskStatusFormAction(formData: FormData): Promise<void> {
  try {
    const container = await createDependencyContainer();
    const taskService = container.taskApplicationService;
    
    const taskId = formData.get('taskId') as string;
    const status = formData.get('status') as string;
    
    await taskService.changeTaskStatus(taskId, status as TaskStatusLiteral);
    revalidatePath('/dashboard');
  } catch (error) {
    console.error('ステータス更新エラー:', error);
    // Server Componentでは例外を投げる
    throw error;
  }
}

export async function deleteTaskAction(prevState: ActionState | null, taskId: string): Promise<ActionState> {
  try {
    const container = await createDependencyContainer();
    const taskService = container.taskApplicationService;
    
    await taskService.deleteTask(taskId);
    revalidatePath('/dashboard');
    return {
      success: true,
      message: 'タスクが削除されました'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'タスクの削除に失敗しました'
    };
  }
}

export async function moveTaskAction(prevState: ActionState | null, taskId: string, newListId: string): Promise<ActionState> {
  try {
    const container = await createDependencyContainer();
    const taskService = container.taskApplicationService;
    
    await taskService.moveTaskToList(taskId, newListId);
    revalidatePath('/dashboard');
    return {
      success: true,
      message: 'タスクが移動されました'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'タスクの移動に失敗しました'
    };
  }
}

export async function updateTaskAction(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  try {
    const container = await createDependencyContainer();
    const taskService = container.taskApplicationService;
    
    const taskId = formData.get('taskId') as string;
    
    await taskService.updateTask(taskId, {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      dueDate: formData.get('dueDate') as string,
    });
    
    revalidatePath('/dashboard');
    return {
      success: true,
      message: 'タスクが正常に更新されました'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'タスクの更新に失敗しました'
    };
  }
}

export async function createTaskWithNewListAction(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    const container = await createDependencyContainer();
    const taskListService = container.taskListApplicationService;
    const taskService = container.taskApplicationService;
    
    const listName = formData.get('listName') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const dueDate = formData.get('dueDate') as string;
    
    // 1. 新しいタスクリストを作成
    const newList = await taskListService.createTaskList({
      name: listName,
    });
    
    // 2. 作成されたリストにタスクを追加
    await taskService.createTask({
      title,
      description,
      dueDate,
      listId: newList.id,
    });
    
    revalidatePath('/dashboard');
    return {
      success: true,
      message: 'タスクリストとタスクが正常に作成されました'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'タスクリストとタスクの作成に失敗しました'
    };
  }
}