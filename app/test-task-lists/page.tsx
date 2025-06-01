'use client';

import { useState, useEffect } from 'react';

interface TaskListDto {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export default function TestTaskListsPage() {
  const [taskLists, setTaskLists] = useState<TaskListDto[]>([]);
  const [newListName, setNewListName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTaskLists = async () => {
    try {
      const response = await fetch('/api/task-lists');
      if (response.ok) {
        const data = await response.json();
        setTaskLists(data);
      } else {
        setError('Failed to fetch task lists');
      }
    } catch {
      setError('Error fetching task lists');
    }
  };

  const createTaskList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/task-lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newListName }),
      });

      if (response.ok) {
        setNewListName('');
        await fetchTaskLists();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create task list');
      }
    } catch {
      setError('Error creating task list');
    } finally {
      setLoading(false);
    }
  };

  const deleteTaskList = async (id: string) => {
    try {
      const response = await fetch(`/api/task-lists/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchTaskLists();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete task list');
      }
    } catch {
      setError('Error deleting task list');
    }
  };

  useEffect(() => {
    fetchTaskLists();
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Task Lists Test Page</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={createTaskList} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="Enter task list name"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !newListName.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create List'}
          </button>
        </div>
      </form>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold mb-3">Task Lists ({taskLists.length})</h2>
        {taskLists.length === 0 ? (
          <p className="text-gray-500">No task lists found. Create one above!</p>
        ) : (
          taskLists.map((list) => (
            <div
              key={list.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-md"
            >
              <div>
                <h3 className="font-medium">{list.name}</h3>
                <p className="text-sm text-gray-500">
                  Created: {new Date(list.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => deleteTaskList(list.id)}
                className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded-md">
        <h3 className="font-semibold mb-2">Implementation Status</h3>
        <ul className="text-sm space-y-1">
          <li>✅ CreateTaskListUseCase implemented</li>
          <li>✅ Ports & Adapters architecture</li>
          <li>✅ In-memory repository</li>
          <li>✅ Application service with validation</li>
          <li>✅ Error handling</li>
          <li>✅ API Routes integration</li>
          <li>✅ Unit tests (11/11 passing)</li>
        </ul>
      </div>
    </div>
  );
}