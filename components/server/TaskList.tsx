import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
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
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">{getTitle()}</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {filter 
                  ? `${getTitle()}がありません`
                  : 'タスクがありません。新しいタスクを作成してください。'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}