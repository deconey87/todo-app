'use client'

import { useState, useActionState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { updateTaskAction, type ActionState } from '../../app/actions/task-actions';
import { TaskDto } from '../../src/application/dto/TaskDto';

interface TaskEditModalProps {
  task: TaskDto;
}

export function TaskEditModal({ task }: TaskEditModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState<ActionState | null, FormData>(
    updateTaskAction,
    null
  );

  // 成功時にモーダルを閉じる
  useEffect(() => {
    if (state?.success) {
      setIsOpen(false);
    }
  }, [state?.success]);

  const handleSubmit = (formData: FormData) => {
    // taskIdをformDataに追加
    formData.set('taskId', task.id);
    formAction(formData);
  };

  // 日付をinput[type="date"]用の形式に変換
  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          <span className="sr-only">編集</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>タスクを編集</DialogTitle>
          <DialogDescription>
            タスクの詳細を編集してください。
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          {state?.error && (
            <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {state.error}
            </div>
          )}
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                タイトル
              </Label>
              <Input
                id="title"
                name="title"
                defaultValue={task.title}
                className="col-span-3"
                required
                disabled={isPending}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                説明
              </Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={task.description || ''}
                className="col-span-3"
                rows={3}
                disabled={isPending}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right">
                期限
              </Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                defaultValue={formatDateForInput(task.dueDate)}
                className="col-span-3"
                disabled={isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isPending}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? '更新中...' : '更新'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}