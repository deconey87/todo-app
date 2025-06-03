import { TaskDto } from '../../src/application/dto/TaskDto';
import { TaskListDto } from '../../src/application/dto/TaskListDto';
import { TaskItem } from './TaskItem';
import { TaskStatusLiteral, TaskStatusConverter } from '../../src/shared/types/TaskStatus';

interface TaskListProps {
  tasks: TaskDto[];
  selectedListId?: string;
  filter?: string;
  taskLists?: TaskListDto[];
}

export function TaskList({ tasks, selectedListId, filter, taskLists }: TaskListProps) {
  const getTitle = () => {
    if (filter) {
      if (filter === 'TODO' || filter === 'IN_PROGRESS' || filter === 'DONE') {
        const label = TaskStatusConverter.getLabel(filter as TaskStatusLiteral);
        return `${label}のタスク`;
      }
      return 'タスク一覧';
    }
    return selectedListId ? 'タスク一覧' : 'すべてのタスク';
  };

  return (
    <div className="flex-1 p-6">
      <section className="surface-1 rounded-lg border border-divider overflow-hidden">
        <header className="px-6 py-4 border-b border-divider surface-2">
          <h1 className="text-xl font-semibold text-foreground">{getTitle()}</h1>
        </header>
        
        {tasks.length === 0 ? (
          <div className="text-center py-12 px-6">
            <p className="text-muted-foreground">
              {filter
                ? `${getTitle()}がありません`
                : 'タスクがありません。新しいタスクを作成してください。'
              }
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {tasks.map((task) => (
              <TaskItem key={task.id} task={task} taskLists={taskLists} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}