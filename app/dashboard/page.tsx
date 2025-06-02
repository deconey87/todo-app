import { createDependencyContainer } from '../../src/infrastructure/config/DependencyInjection';
import { TaskListSidebar } from '../../components/server/TaskListSidebar';
import { TaskList } from '../../components/server/TaskList';
import { DashboardHeader } from '../../components/server/DashboardHeader';
import { TaskDto } from '../../src/application/dto/TaskDto';

interface DashboardPageProps {
  searchParams: Promise<{
    list?: string;
    filter?: string;
    sort?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const container = createDependencyContainer();
  const taskListService = container.taskListApplicationService;
  const taskService = container.taskApplicationService;
  
  // サーバーサイドでデータ取得
  const taskLists = await taskListService.getAllTaskLists();
  const selectedListId = params.list || taskLists[0]?.id;
  
  let tasks: TaskDto[] = [];
  if (selectedListId) {
    if (params.filter) {
      tasks = await taskService.getTasksByStatus(params.filter);
    } else {
      tasks = await taskService.getTasksByListId(selectedListId);
    }
    
    if (params.sort === 'dueDate') {
      tasks = await taskService.getTasksSortedByDueDate(true);
    }
  }
  
  return (
    <div className="flex h-screen">
      <TaskListSidebar
        taskLists={taskLists}
        selectedListId={selectedListId}
      />
      <main className="flex-1 flex flex-col">
        <DashboardHeader />
        <TaskList
          tasks={tasks}
          selectedListId={selectedListId}
          filter={params.filter}
        />
      </main>
    </div>
  );
}