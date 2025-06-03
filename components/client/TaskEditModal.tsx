'use client'

import { useState } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { updateTaskAction } from '../../app/actions/task-actions';
import { TaskDto } from '../../src/application/dto/TaskDto';

interface TaskEditModalProps {
  task: TaskDto;
}

export function TaskEditModal({ task }: TaskEditModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true);
      await updateTaskAction(task.id, formData);
      setIsOpen(false);
    } catch (error) {
      console.error('タスクの更新に失敗しました:', error);
      // TODO: エラートーストを表示
    } finally {
      setIsSubmitting(false);
    }
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
        <Button variant="ghost" size="sm">
          編集
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
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '更新中...' : '更新'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}