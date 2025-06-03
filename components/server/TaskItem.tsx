import { Button } from '../ui/button';
import { TaskDto } from '../../src/application/dto/TaskDto';
import { updateTaskStatusAction } from '../../app/actions/task-actions';
import { TaskStatusLiteral, TaskStatusConverter } from '../../src/shared/types/TaskStatus';

interface TaskItemProps {
  task: TaskDto;
}

export function TaskItem({ task }: TaskItemProps) {
  const getStatusColor = (status: TaskStatusLiteral) => {
    const label = TaskStatusConverter.getLabel(status);
    switch (label) {
      case '未着手':
        return 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/60';
      case '進行中':
        return 'bg-yellow-50 dark:bg-yellow-950/60 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/60';
      case '完了':
        return 'bg-green-50 dark:bg-green-950/60 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800/60';
      default:
        return 'bg-gray-50 dark:bg-gray-900/60 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700/60';
    }
  };

  const getNextStatus = (currentStatus: TaskStatusLiteral) => {
    switch (currentStatus) {
      case 'TODO':
        return { label: '開始', value: 'IN_PROGRESS' as TaskStatusLiteral };
      case 'IN_PROGRESS':
        return { label: '完了', value: 'DONE' as TaskStatusLiteral };
      case 'DONE':
        return { label: '再開', value: 'TODO' as TaskStatusLiteral };
      default:
        return { label: '開始', value: 'IN_PROGRESS' as TaskStatusLiteral };
    }
  };

  const nextStatus = getNextStatus(task.status);
  const statusLabel = TaskStatusConverter.getLabel(task.status);

  return (
    <li className="py-4 px-6 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors duration-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-50 mb-2">{task.title}</h3>
          
          {task.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm leading-relaxed">{task.description}</p>
          )}
          
          {task.dueDate && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-3">
              期限: {new Date(task.dueDate).toLocaleDateString('ja-JP')}
            </p>
          )}

          <div className="flex items-center gap-3">
            <form action={updateTaskStatusAction.bind(null, task.id, nextStatus.value)}>
              <Button type="submit" size="sm" variant="outline">
                {nextStatus.label}
              </Button>
            </form>
          </div>
        </div>
        
        <div className="flex-shrink-0">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
            {statusLabel}
          </span>
        </div>
      </div>
    </li>
  );
}