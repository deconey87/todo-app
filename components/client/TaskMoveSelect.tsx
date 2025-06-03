'use client'

import { useState } from 'react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { moveTaskAction } from '../../app/actions/task-actions';
import { TaskListDto } from '../../src/application/dto/TaskListDto';

interface TaskMoveSelectProps {
  taskId: string;
  currentListId: string;
  taskLists: TaskListDto[];
}

export function TaskMoveSelect({ taskId, currentListId, taskLists }: TaskMoveSelectProps) {
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [isMoving, setIsMoving] = useState(false);

  const availableLists = taskLists.filter(list => list.id !== currentListId);

  const handleMove = async () => {
    if (!selectedListId) return;
    
    try {
      setIsMoving(true);
      await moveTaskAction(taskId, selectedListId);
      setSelectedListId('');
    } catch (error) {
      console.error('タスクの移動に失敗しました:', error);
      // TODO: エラートーストを表示
    } finally {
      setIsMoving(false);
    }
  };

  if (availableLists.length === 0) {
    return null; // 移動先がない場合は表示しない
  }

  return (
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
        disabled={!selectedListId || isMoving}
      >
        {isMoving ? '移動中...' : '移動'}
      </Button>
    </div>
  );
}