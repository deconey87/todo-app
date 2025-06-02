import Link from 'next/link';
import { Button } from '../ui/button';
import { TaskListDto } from '../../src/application/dto/TaskListDto';
import { TASK_STATUS_VALUES, TaskStatusConverter } from '../../src/shared/types/TaskStatus';

interface TaskListSidebarProps {
  taskLists: TaskListDto[];
  selectedListId?: string;
}

export function TaskListSidebar({ taskLists, selectedListId }: TaskListSidebarProps) {
  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200">
      <section className="p-4 accent-left">
        <h2 className="text-subheading mb-4">タスクリスト</h2>
        <div className="space-y-2">
          {taskLists.map((list) => (
            <Link
              key={list.id}
              href={`/dashboard?list=${list.id}`}
              className="block"
            >
              <Button
                variant={selectedListId === list.id ? "default" : "ghost"}
                className="w-full justify-start"
              >
                {list.name}
              </Button>
            </Link>
          ))}
          
          {taskLists.length === 0 && (
            <p className="text-caption text-muted-foreground text-center py-4">
              タスクリストがありません
            </p>
          )}
        </div>
      </section>

      <section className="p-4 border-t border-gray-200 accent-left">
        <h2 className="text-subheading mb-4">フィルター</h2>
        <div className="space-y-2">
          <Link href="/dashboard" className="block">
            <Button variant="ghost" className="w-full justify-start">
              すべてのタスク
            </Button>
          </Link>
          {TASK_STATUS_VALUES.map((status) => (
            <Link key={status} href={`/dashboard?filter=${status}`} className="block">
              <Button variant="ghost" className="w-full justify-start">
                {TaskStatusConverter.getLabel(status)}
              </Button>
            </Link>
          ))}
        </div>
      </section>
    </aside>
  );
}