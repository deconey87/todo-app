import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TaskDto } from '../../src/application/dto/TaskDto';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: TaskDto[];
  selectedListId?: string;
  filter?: string;
}

export function TaskList({ tasks, selectedListId, filter }: TaskListProps) {
  const getTitle = () => {
    if (filter) {
      switch (filter) {
        case 'TODO':
          return '未着手のタスク';
        case 'IN_PROGRESS':
          return '進行中のタスク';
        case 'DONE':
          return '完了したタスク';
        default:
          return 'タスク一覧';
      }
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