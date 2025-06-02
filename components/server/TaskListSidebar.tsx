import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { TaskListDto } from '../../src/application/dto/TaskListDto';

interface TaskListSidebarProps {
  taskLists: TaskListDto[];
  selectedListId?: string;
}

export function TaskListSidebar({ taskLists, selectedListId }: TaskListSidebarProps) {
  return (
    <aside className="w-64 bg-muted/50 border-r">
      <Card className="m-4 mb-4">
        <CardHeader>
          <CardTitle className="text-lg">タスクリスト</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
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
            <p className="text-sm text-muted-foreground text-center py-4">
              タスクリストがありません
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="m-4">
        <CardHeader>
          <CardTitle className="text-lg">フィルター</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Link href="/dashboard" className="block">
            <Button variant="ghost" className="w-full justify-start">
              すべてのタスク
            </Button>
          </Link>
          <Link href="/dashboard?filter=TODO" className="block">
            <Button variant="ghost" className="w-full justify-start">
              未着手
            </Button>
          </Link>
          <Link href="/dashboard?filter=IN_PROGRESS" className="block">
            <Button variant="ghost" className="w-full justify-start">
              進行中
            </Button>
          </Link>
          <Link href="/dashboard?filter=DONE" className="block">
            <Button variant="ghost" className="w-full justify-start">
              完了
            </Button>
          </Link>
        </CardContent>
      </Card>
    </aside>
  );
}