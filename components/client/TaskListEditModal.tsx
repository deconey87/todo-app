'use client'

import { useState, useActionState, useEffect } from 'react';
import { updateTaskListAction, type ActionState } from '@/app/actions/task-list-actions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TaskListEditModalProps {
  listId: string;
  currentName: string;
  trigger?: React.ReactNode;
}

export function TaskListEditModal({ listId, currentName, trigger }: TaskListEditModalProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState<ActionState | null, FormData>(
    updateTaskListAction,
    null
  );

  // 成功時にモーダルを閉じる
  useEffect(() => {
    if (state?.success) {
      setOpen(false);
    }
  }, [state?.success]);

  const handleSubmit = (formData: FormData) => {
    // バリデーション
    const name = formData.get('name') as string;

    if (!name?.trim()) {
      return;
    }

    if (name.trim().length > 50) {
      return;
    }

    formAction(formData);
  };

  const defaultTrigger = (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0 text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        <path d="m15 5 4 4" />
      </svg>
      <span className="sr-only">編集</span>
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>タスクリスト名を編集</DialogTitle>
          <DialogDescription>
            タスクリストの名前を変更してください。
          </DialogDescription>
        </DialogHeader>
        
        <form id="task-list-edit-form" action={handleSubmit} className="space-y-4">
          <input type="hidden" name="listId" value={listId} />
          
          {state?.error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {state.error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name">リスト名 *</Label>
            <Input
              id="name"
              name="name"
              defaultValue={currentName}
              placeholder="例: 仕事のタスク、個人プロジェクト"
              required
              disabled={isPending}
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">
              50文字以内で入力してください
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? '更新中...' : 'リスト名を更新'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}