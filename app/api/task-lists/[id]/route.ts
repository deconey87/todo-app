import { NextRequest, NextResponse } from 'next/server';
import { DependencyContainerFactory } from '../../../../src/infrastructure/config/DependencyInjection';
import { TaskListNotFoundError } from '../../../../src/application/errors/ApplicationError';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const container = DependencyContainerFactory.create();
    const taskListService = container.getTaskListService();
    const taskList = await taskListService.getTaskList(params.id);
    
    if (!taskList) {
      return NextResponse.json(
        { error: 'Task list not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(taskList);
  } catch (error) {
    console.error('Error fetching task list:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const container = DependencyContainerFactory.create();
    const taskListService = container.getTaskListService();
    await taskListService.deleteTaskList(params.id);
    
    return NextResponse.json({ message: 'Task list deleted successfully' });
  } catch (error) {
    console.error('Error deleting task list:', error);
    
    if (error instanceof TaskListNotFoundError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}