'use client'

import { useState, useActionState, useEffect } from 'react';
import { createTaskListAction, type ActionState } from '@/app/actions/task-list-actions';
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

interface TaskListFormModalProps {
  trigger?: React.ReactNode;
}

export function TaskListFormModal({ trigger }: TaskListFormModalProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState<ActionState | null, FormData>(
    createTaskListAction,
    null
  );

  // 成功時にモーダルを閉じてフォームをリセット
  useEffect(() => {
    if (state?.success) {
      setOpen(false);
    }
  }, [state?.success]);

  const handleSubmit = (formData: FormData) => {
    // バリデーション
    const name = formData.get('name') as string;

    if (!name?.trim()) {
      // クライアントサイドバリデーションエラーは手動で状態を設定
      return;
    }

    if (name.trim().length > 50) {
      return;
    }

    formAction(formData);
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="gap-2 w-full">
      <span>+</span>
      新しいリスト
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>新しいタスクリストを作成</DialogTitle>
          <DialogDescription>
            タスクリストの名前を入力してください。関連するタスクをまとめて管理できます。
          </DialogDescription>
        </DialogHeader>
        
        <form id="task-list-form" action={handleSubmit} className="space-y-4">
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
              {isPending ? '作成中...' : 'リストを作成'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}