'use client'

import { useState, useActionState, useEffect, startTransition } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { deleteTaskListAction, type ActionState } from '../../app/actions/task-list-actions';

interface TaskListDeleteButtonProps {
  listId: string;
  listName: string;
}

export function TaskListDeleteButton({ listId, listName }: TaskListDeleteButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState<ActionState | null, string>(
    deleteTaskListAction,
    null
  );

  // 成功時にモーダルを閉じる
  useEffect(() => {
    if (state?.success) {
      setIsOpen(false);
    }
  }, [state?.success]);

  const handleDelete = () => {
    startTransition(() => {
      formAction(listId);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/30"
        >
          削除
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>タスクリストを削除</DialogTitle>
          <DialogDescription>
            「{listName}」を削除しますか？このタスクリストに含まれるすべてのタスクも削除されます。この操作は取り消せません。
          </DialogDescription>
        </DialogHeader>
        {state?.error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {state.error}
          </div>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isPending}
          >
            キャンセル
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? '削除中...' : '削除'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}