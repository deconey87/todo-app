import Link from 'next/link';
import { Button } from '../ui/button';
import { TaskListDto } from '../../src/application/dto/TaskListDto';
import { TASK_STATUS_VALUES, TaskStatusConverter } from '../../src/shared/types/TaskStatus';
import { TaskListFormModal } from '../client/TaskListFormModal';
import { TaskListDeleteButton } from '../client/TaskListDeleteButton';

interface TaskListSidebarProps {
  taskLists: TaskListDto[];
  selectedListId?: string;
}

export function TaskListSidebar({ taskLists, selectedListId }: TaskListSidebarProps) {
  return (
    <aside className="w-64 surface-2 border-r border-divider">
      <section className="p-4 accent-left">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-subheading">タスクリスト</h2>
        </div>
        <div className="space-y-2">
          {taskLists.map((list) => (
            <div key={list.id} className="flex items-center gap-2">
              <Link
                href={`/dashboard?list=${list.id}`}
                className="flex-1"
              >
                <Button
                  variant={selectedListId === list.id ? "default" : "ghost"}
                  className="w-full justify-start"
                >
                  {list.name}
                </Button>
              </Link>
              <TaskListDeleteButton
                listId={list.id}
                listName={list.name}
              />
            </div>
          ))}
          
          {taskLists.length === 0 && (
            <p className="text-caption text-muted-foreground text-center py-4">
              タスクリストがありません
            </p>
          )}
          
          <div className="pt-2">
            <TaskListFormModal />
          </div>
        </div>
      </section>

      <section className="p-4 border-t border-divider accent-left">
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