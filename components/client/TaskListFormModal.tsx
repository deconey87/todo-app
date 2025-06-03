'use client'

import { useState } from 'react';
import { createTaskListAction } from '@/app/actions/task-list-actions';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // バリデーション
      const name = formData.get('name') as string;

      if (!name?.trim()) {
        throw new Error('タスクリスト名は必須です');
      }

      if (name.trim().length > 50) {
        throw new Error('タスクリスト名は50文字以内で入力してください');
      }

      await createTaskListAction(formData);
      setOpen(false);
      
      // フォームをリセット
      const form = document.getElementById('task-list-form') as HTMLFormElement;
      form?.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'タスクリストの作成に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
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
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name">リスト名 *</Label>
            <Input
              id="name"
              name="name"
              placeholder="例: 仕事のタスク、個人プロジェクト"
              required
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '作成中...' : 'リストを作成'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}