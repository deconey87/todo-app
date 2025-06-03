import { Pool, PoolClient } from 'pg';
import { TaskListRepositoryPort } from '../../../../application/ports/output/TaskListRepositoryPort';
import { TaskList } from '../../../../domain/taskList/TaskList';
import { ListId } from '../../../../domain/shared/types';
import { ListName } from '../../../../domain/taskList/ListName.vo';
import { v4 as uuidv4 } from 'uuid';

interface TaskListRecord {
  id: string;
  name: string;
  created_at: Date;
}

export class PostgreSQLTaskListRepository implements TaskListRepositoryPort {
  constructor(private pool: Pool) {}

  async findById(listId: ListId): Promise<TaskList | null> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM task_lists WHERE id = $1',
        [listId as string]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapRecordToTaskList(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to find task list by id: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      client.release();
    }
  }

  async findAll(): Promise<TaskList[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM task_lists ORDER BY created_at ASC'
      );
      
      return result.rows.map((row: TaskListRecord) => this.mapRecordToTaskList(row));
    } catch (error) {
      throw new Error(`Failed to find all task lists: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      client.release();
    }
  }

  async save(taskList: TaskList): Promise<void> {
    const client = await this.pool.connect();
    try {
      // UPSERTを使用して新規作成・更新を統一的に処理
      await client.query(`
        INSERT INTO task_lists (id, name, created_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (id) 
        DO UPDATE SET 
          name = EXCLUDED.name
      `, [
        taskList.id as string,
        taskList.name.value
      ]);
    } catch (error) {
      if (error instanceof Error && error.message.includes('unique constraint')) {
        throw new Error(`Task list with name "${taskList.name.value}" already exists`);
      }
      throw new Error(`Failed to save task list: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      client.release();
    }
  }

  async delete(listId: ListId): Promise<void> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'DELETE FROM task_lists WHERE id = $1',
        [listId as string]
      );
      
      if (result.rowCount === 0) {
        throw new Error(`Task list with id ${listId as string} not found`);
      }
    } catch (error) {
      throw new Error(`Failed to delete task list: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      client.release();
    }
  }

  async findByName(name: ListName): Promise<TaskList | null> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM task_lists WHERE name = $1',
        [name.value]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapRecordToTaskList(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to find task list by name: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      client.release();
    }
  }

  async nextId(): Promise<ListId> {
    return ListId.create(uuidv4());
  }

  // トランザクション対応のオーバーロードメソッド
  async findByIdWithClient(listId: ListId, client: PoolClient): Promise<TaskList | null> {
    try {
      const result = await client.query(
        'SELECT * FROM task_lists WHERE id = $1',
        [listId as string]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapRecordToTaskList(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to find task list by id: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async saveWithClient(taskList: TaskList, client: PoolClient): Promise<void> {
    try {
      await client.query(`
        INSERT INTO task_lists (id, name, created_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (id) 
        DO UPDATE SET 
          name = EXCLUDED.name
      `, [
        taskList.id as string,
        taskList.name.value
      ]);
    } catch (error) {
      if (error instanceof Error && error.message.includes('unique constraint')) {
        throw new Error(`Task list with name "${taskList.name.value}" already exists`);
      }
      throw new Error(`Failed to save task list: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private mapRecordToTaskList(record: TaskListRecord): TaskList {
    try {
      const listId = ListId.create(record.id);
      const name = new ListName(record.name);

      return new TaskList(listId, name);
    } catch (error) {
      throw new Error(`Failed to map database record to TaskList: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}