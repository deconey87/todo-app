import { Pool, PoolClient } from 'pg';
import { TaskRepositoryPort } from '../../../../application/ports/output/TaskRepositoryPort';
import { Task } from '../../../../domain/task/Task';
import { TaskId, ListId } from '../../../../domain/shared/types';
import { Title } from '../../../../domain/task/Title.vo';
import { Description } from '../../../../domain/task/Description.vo';
import { DueDate } from '../../../../domain/task/DueDate.vo';
import { Status, TaskStatusEnum } from '../../../../domain/task/Status.vo';
import { TaskStatusLiteral, isValidTaskStatus } from '../../../../shared/types/TaskStatus';
import { v4 as uuidv4 } from 'uuid';

interface TaskRecord {
  id: string;
  title: string;
  description: string;
  status: string;
  due_date: Date | null;
  task_list_id: string;
  created_at: Date;
  updated_at: Date;
}

export class PostgreSQLTaskRepository implements TaskRepositoryPort {
  constructor(private pool: Pool) {}

  async findById(taskId: TaskId): Promise<Task | null> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM tasks WHERE id = $1',
        [taskId as string]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapRecordToTask(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to find task by id: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      client.release();
    }
  }

  async findByListId(listId: ListId): Promise<Task[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM tasks WHERE task_list_id = $1 ORDER BY created_at ASC',
        [listId as string]
      );
      
      return result.rows.map((row: TaskRecord) => this.mapRecordToTask(row));
    } catch (error) {
      throw new Error(`Failed to find tasks by list id: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      client.release();
    }
  }

  async findAll(): Promise<Task[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM tasks ORDER BY created_at ASC'
      );
      
      return result.rows.map((row: TaskRecord) => this.mapRecordToTask(row));
    } catch (error) {
      throw new Error(`Failed to find all tasks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      client.release();
    }
  }

  async save(task: Task): Promise<void> {
    const client = await this.pool.connect();
    try {
      // UPSERTを使用して新規作成・更新を統一的に処理
      await client.query(`
        INSERT INTO tasks (id, title, description, status, due_date, task_list_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        ON CONFLICT (id) 
        DO UPDATE SET 
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          status = EXCLUDED.status,
          due_date = EXCLUDED.due_date,
          task_list_id = EXCLUDED.task_list_id,
          updated_at = NOW()
      `, [
        task.id as string,
        task.title.value,
        task.description.value,
        task.status.value,
        task.dueDate?.value || null,
        task.listId as string
      ]);
    } catch (error) {
      if (error instanceof Error && error.message.includes('foreign key constraint')) {
        throw new Error(`Task list with id ${task.listId as string} does not exist`);
      }
      throw new Error(`Failed to save task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      client.release();
    }
  }

  async delete(taskId: TaskId): Promise<void> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'DELETE FROM tasks WHERE id = $1',
        [taskId as string]
      );
      
      if (result.rowCount === 0) {
        throw new Error(`Task with id ${taskId as string} not found`);
      }
    } catch (error) {
      throw new Error(`Failed to delete task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      client.release();
    }
  }

  async deleteByListId(listId: ListId): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(
        'DELETE FROM tasks WHERE task_list_id = $1',
        [listId as string]
      );
    } catch (error) {
      throw new Error(`Failed to delete tasks by list id: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      client.release();
    }
  }

  async nextId(): Promise<TaskId> {
    return TaskId.create(uuidv4());
  }

  // トランザクション対応のオーバーロードメソッド
  async findByIdWithClient(taskId: TaskId, client: PoolClient): Promise<Task | null> {
    try {
      const result = await client.query(
        'SELECT * FROM tasks WHERE id = $1',
        [taskId as string]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapRecordToTask(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to find task by id: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async saveWithClient(task: Task, client: PoolClient): Promise<void> {
    try {
      await client.query(`
        INSERT INTO tasks (id, title, description, status, due_date, task_list_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        ON CONFLICT (id) 
        DO UPDATE SET 
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          status = EXCLUDED.status,
          due_date = EXCLUDED.due_date,
          task_list_id = EXCLUDED.task_list_id,
          updated_at = NOW()
      `, [
        task.id as string,
        task.title.value,
        task.description.value,
        task.status.value,
        task.dueDate?.value || null,
        task.listId as string
      ]);
    } catch (error) {
      if (error instanceof Error && error.message.includes('foreign key constraint')) {
        throw new Error(`Task list with id ${task.listId as string} does not exist`);
      }
      throw new Error(`Failed to save task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private mapRecordToTask(record: TaskRecord): Task {
    try {
      const taskId = TaskId.create(record.id);
      const title = new Title(record.title);
      const description = new Description(record.description);
      const dueDate = record.due_date ? DueDate.create(record.due_date) : null;
      
      // ステータスの変換処理
      if (!isValidTaskStatus(record.status)) {
        throw new Error(`Invalid task status in database: ${record.status}`);
      }
      
      // TaskStatusLiteralからTaskStatusEnumに変換
      let statusEnum: TaskStatusEnum;
      switch (record.status as TaskStatusLiteral) {
        case 'TODO':
          statusEnum = TaskStatusEnum.TODO;
          break;
        case 'IN_PROGRESS':
          statusEnum = TaskStatusEnum.IN_PROGRESS;
          break;
        case 'DONE':
          statusEnum = TaskStatusEnum.DONE;
          break;
        default:
          throw new Error(`Unhandled task status: ${record.status}`);
      }
      
      const status = new Status(statusEnum);
      const listId = ListId.create(record.task_list_id);

      return new Task(
        taskId,
        title,
        description,
        dueDate,
        status,
        listId
      );
    } catch (error) {
      throw new Error(`Failed to map database record to Task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}