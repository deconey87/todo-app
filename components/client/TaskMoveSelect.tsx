'use client'

import { useState, useActionState, useEffect, startTransition } from 'react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { moveTaskAction, type ActionState } from '../../app/actions/task-actions';
import { TaskListDto } from '../../src/application/dto/TaskListDto';

interface TaskMoveSelectProps {
  taskId: string;
  currentListId: string;
  taskLists: TaskListDto[];
}

export function TaskMoveSelect({ taskId, currentListId, taskLists }: TaskMoveSelectProps) {
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [state, formAction, isPending] = useActionState<ActionState | null, { taskId: string; newListId: string }>(
    async (prevState: ActionState | null, payload: { taskId: string; newListId: string }) => {
      return await moveTaskAction(prevState, payload.taskId, payload.newListId);
    },
    null
  );

  const availableLists = taskLists.filter(list => list.id !== currentListId);

  // 成功時にセレクトをリセット
  useEffect(() => {
    if (state?.success) {
      setSelectedListId('');
    }
  }, [state?.success]);

  const handleMove = () => {
    if (!selectedListId) return;
    
    startTransition(() => {
      formAction({ taskId, newListId: selectedListId });
    });
  };

  if (availableLists.length === 0) {
    return null; // 移動先がない場合は表示しない
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Select value={selectedListId} onValueChange={setSelectedListId}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="移動先" />
          </SelectTrigger>
          <SelectContent>
            {availableLists.map((list) => (
              <SelectItem key={list.id} value={list.id}>
                {list.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          variant="outline"
          onClick={handleMove}
          disabled={!selectedListId || isPending}
        >
          {isPending ? '移動中...' : '移動'}
        </Button>
      </div>
      {state?.error && (
        <div className="p-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md">
          {state.error}
        </div>
      )}
    </div>
  );
}