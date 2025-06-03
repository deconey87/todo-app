'use client'

import { useState, useActionState, useEffect } from 'react';
import { createTaskAction, createTaskWithNewListAction, type ActionState } from '@/app/actions/task-actions';
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
  const [newListName, setNewListName] = useState<string>('');
  const hasTaskLists = taskLists.length > 0;
  
  const [state, formAction, isPending] = useActionState<ActionState | null, FormData>(
    createTaskAction,
    null
  );

  // 成功時にモーダルを閉じてフォームをリセット
  useEffect(() => {
    if (state?.success) {
      setOpen(false);
      setSelectedList(selectedListId || '');
      setNewListName('');
    }
  }, [state?.success, selectedListId]);

  const handleSubmit = async (formData: FormData) => {
    // バリデーション
    const title = formData.get('title') as string;

    if (!title?.trim()) {
      // クライアントサイドバリデーションエラーは手動で状態を設定
      return;
    }

    if (hasTaskLists) {
      // 既存のタスクリストがある場合：リスト選択が必須
      if (!selectedList) {
        return;
      }
      // selectedListをformDataに追加
      formData.set('listId', selectedList);
      formAction(formData);
    } else {
      // タスクリストがない場合：新規リスト名が必須
      if (!newListName?.trim()) {
        return;
      }
      // newListNameをformDataに追加
      formData.set('listName', newListName);
      // 新しいリストとタスクを作成するアクションを直接呼び出し
      const result = await createTaskWithNewListAction(null, formData);
      if (result.success) {
        setOpen(false);
        setSelectedList('');
        setNewListName('');
        // ページをリロードして最新の状態を反映
        window.location.reload();
      }
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

          {hasTaskLists ? (
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
          ) : (
            <div className="space-y-2">
              <Label htmlFor="listName">新しいリスト名 *</Label>
              <Input
                id="listName"
                name="listName"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="例: 仕事のタスク"
                required
                disabled={isPending}
              />
              <p className="text-sm text-muted-foreground">
                タスクリストが存在しないため、新しいリストを作成してタスクを追加します。
              </p>
            </div>
          )}

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
              {isPending
                ? '作成中...'
                : hasTaskLists
                  ? 'タスクを作成'
                  : 'リストとタスクを作成'
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}