'use server'

import { createDependencyContainer } from '../../src/infrastructure/config/DependencyInjection';
import { revalidatePath } from 'next/cache';

export async function createTaskListAction(formData: FormData) {
  const container = await createDependencyContainer();
  const taskListService = container.taskListApplicationService;
  
  const result = await taskListService.createTaskList({
    name: formData.get('name') as string,
  });
  
  revalidatePath('/dashboard');
  return result;
}

export async function deleteTaskListAction(listId: string) {
  const container = await createDependencyContainer();
  const taskListService = container.taskListApplicationService;
  
  await taskListService.deleteTaskListWithTasks(listId);
  revalidatePath('/dashboard');
}