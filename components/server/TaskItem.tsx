import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
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
        return 'bg-red-100 text-red-800';
      case '進行中':
        return 'bg-yellow-100 text-yellow-800';
      case '完了':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{task.title}</CardTitle>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
            {statusLabel}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {task.description && (
          <p className="text-muted-foreground mb-3">{task.description}</p>
        )}
        
        {task.dueDate && (
          <p className="text-sm text-muted-foreground mb-3">
            期限: {new Date(task.dueDate).toLocaleDateString('ja-JP')}
          </p>
        )}

        <div className="flex gap-2">
          <form action={updateTaskStatusAction.bind(null, task.id, nextStatus.value)}>
            <Button type="submit" size="sm">
              {nextStatus.label}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}