import { NextRequest, NextResponse } from 'next/server';
import { DependencyContainerFactory } from '../../../src/infrastructure/config/DependencyInjection';
import { CreateTaskListDto } from '../../../src/application/dto/CreateTaskListDto';
import { ValidationError, DuplicateTaskListNameError } from '../../../src/application/errors/ApplicationError';

export async function GET() {
  try {
    const container = DependencyContainerFactory.create();
    const taskListService = container.getTaskListService();
    const taskLists = await taskListService.getAllTaskLists();
    
    return NextResponse.json(taskLists);
  } catch (error) {
    console.error('Error fetching task lists:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const dto: CreateTaskListDto = {
      name: body.name
    };

    const container = DependencyContainerFactory.create();
    const taskListService = container.getTaskListService();
    const taskList = await taskListService.createTaskList(dto);
    
    return NextResponse.json(taskList, { status: 201 });
  } catch (error) {
    console.error('Error creating task list:', error);
    
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }
    
    if (error instanceof DuplicateTaskListNameError) {
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