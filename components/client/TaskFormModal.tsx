'use client'

import { useState, useActionState, useEffect } from 'react';
import { createTaskAction, type ActionState } from '@/app/actions/task-actions';
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
  const [selectedList, setSelectedList] = useState<string>(selectedListId || '');
  const [state, formAction, isPending] = useActionState<ActionState | null, FormData>(
    createTaskAction,
    null
  );

  // 成功時にモーダルを閉じてフォームをリセット
  useEffect(() => {
    if (state?.success) {
      setOpen(false);
      setSelectedList(selectedListId || '');
    }
  }, [state?.success, selectedListId]);

  const handleSubmit = (formData: FormData) => {
    // バリデーション
    const title = formData.get('title') as string;

    if (!title?.trim()) {
      // クライアントサイドバリデーションエラーは手動で状態を設定
      return;
    }

    if (!selectedList) {
      return;
    }

    // selectedListをformDataに追加
    formData.set('listId', selectedList);
    formAction(formData);
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
        
        <form id="task-form" action={handleSubmit} className="space-y-4">
          {state?.error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {state.error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="title">タスクタイトル *</Label>
            <Input
              id="title"
              name="title"
              placeholder="例: プロジェクト資料の作成"
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">説明</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="タスクの詳細な説明を入力してください（任意）"
              rows={3}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">期限</Label>
            <Input
              id="dueDate"
              name="dueDate"
              type="date"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="listId">タスクリスト *</Label>
            <Select
              value={selectedList}
              onValueChange={setSelectedList}
              disabled={isPending}
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
              disabled={isPending}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? '作成中...' : 'タスクを作成'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}