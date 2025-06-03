-- PostgreSQL初期化スクリプト
-- TODOアプリケーション用テーブル定義

-- task_lists テーブル
CREATE TABLE task_lists (
  id UUID PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- tasks テーブル  
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL CHECK (status IN ('TODO', 'IN_PROGRESS', 'DONE')),
  due_date TIMESTAMP,
  task_list_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (task_list_id) REFERENCES task_lists(id) ON DELETE CASCADE
);

-- インデックス作成（パフォーマンス最適化）
CREATE INDEX idx_tasks_task_list_id ON tasks(task_list_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);