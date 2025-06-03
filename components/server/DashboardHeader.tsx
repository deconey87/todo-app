import { TaskFormModal } from '../client/TaskFormModal';
import { TaskListDto } from '@/src/application/dto/TaskListDto';

interface DashboardHeaderProps {
  taskLists: TaskListDto[];
  selectedListId?: string;
}

export function DashboardHeader({ taskLists, selectedListId }: DashboardHeaderProps) {
  return (
    <header className="px-6 py-4 divider-bottom">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-display text-foreground mb-2">
            タスク管理ダッシュボード
          </h1>
          <p className="text-body text-muted-foreground">
            タスクを効率的に管理し、プロジェクトを成功に導きましょう。
          </p>
        </div>
        <div className="flex gap-2">
          <TaskFormModal
            taskLists={taskLists}
            selectedListId={selectedListId}
          />
        </div>
      </div>
    </header>
  );
}