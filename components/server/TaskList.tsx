import { TaskDto } from '../../src/application/dto/TaskDto';
import { TaskItem } from './TaskItem';
import { TaskStatusLiteral, TaskStatusConverter } from '../../src/shared/types/TaskStatus';

interface TaskListProps {
  tasks: TaskDto[];
  selectedListId?: string;
  filter?: string;
}

export function TaskList({ tasks, selectedListId, filter }: TaskListProps) {
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
      <section className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <header className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h1 className="text-xl font-semibold text-gray-900">{getTitle()}</h1>
        </header>
        
        {tasks.length === 0 ? (
          <div className="text-center py-12 px-6">
            <p className="text-gray-600">
              {filter
                ? `${getTitle()}がありません`
                : 'タスクがありません。新しいタスクを作成してください。'
              }
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}