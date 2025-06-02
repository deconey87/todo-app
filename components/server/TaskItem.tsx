import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { TaskDto } from '../../src/application/dto/TaskDto';
import { updateTaskStatusAction } from '../../app/actions/task-actions';

interface TaskItemProps {
  task: TaskDto;
}

export function TaskItem({ task }: TaskItemProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
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

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case '未着手':
        return { label: '開始', value: 'IN_PROGRESS' };
      case '進行中':
        return { label: '完了', value: 'DONE' };
      case '完了':
        return { label: '再開', value: 'TODO' };
      default:
        return { label: '開始', value: 'IN_PROGRESS' };
    }
  };

  const nextStatus = getNextStatus(task.status);

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{task.title}</CardTitle>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
            {task.status}
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