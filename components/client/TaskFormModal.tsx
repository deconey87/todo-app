'use client'

import { useState } from 'react';
import { createTaskAction } from '@/app/actions/task-actions';
import { TaskListDto } from '@/src/application/dto/TaskListDto';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TaskFormModalProps {
  taskLists: TaskListDto[];
  selectedListId?: string;
  trigger?: React.ReactNode;
}

export function TaskFormModal({ taskLists, selectedListId, trigger }: TaskFormModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedList, setSelectedList] = useState<string>(selectedListId || '');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      
      // バリデーション
      const title = formData.get('title') as string;

      if (!title?.trim()) {
        throw new Error('タスクタイトルは必須です');
      }

      if (!selectedList) {
        throw new Error('タスクリストを選択してください');
      }

      // selectedListをformDataに追加
      formData.set('listId', selectedList);

      await createTaskAction(formData);
      setOpen(false);
      setSelectedList(selectedListId || '');
      
      // フォームをリセット
      const form = event.currentTarget;
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'タスクの作成に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultTrigger = (
    <Button variant="default" className="gap-2">
      <span>+</span>
      新しいタスク
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>新しいタスクを作成</DialogTitle>
          <DialogDescription>
            タスクの詳細を入力してください。必要な情報を記入後、作成ボタンをクリックしてください。
          </DialogDescription>
        </DialogHeader>
        
        <form id="task-form" onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="title">タスクタイトル *</Label>
            <Input
              id="title"
              name="title"
              placeholder="例: プロジェクト資料の作成"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">説明</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="タスクの詳細な説明を入力してください（任意）"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">期限</Label>
            <Input
              id="dueDate"
              name="dueDate"
              type="date"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="listId">タスクリスト *</Label>
            <Select
              value={selectedList}
              onValueChange={setSelectedList}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="タスクリストを選択してください" />
              </SelectTrigger>
              <SelectContent>
                {taskLists.map((list) => (
                  <SelectItem key={list.id} value={list.id}>
                    {list.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              {isSubmitting ? '作成中...' : 'タスクを作成'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}