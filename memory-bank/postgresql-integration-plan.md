# PostgreSQL統合計画書

## 概要
TODOアプリケーションのデータ永続化をインメモリリポジトリからPostgreSQLに移行する詳細計画。既存の高品質なアーキテクチャ（143個テスト100%通過、DDD原則準拠）を完全保護しながら段階的に実装。

## 技術選択：pq (node-postgres)

### 選択根拠
1. **成熟性と信頼性**
   - 10年以上の実績
   - 週間ダウンロード数300万+
   - PostgreSQL公式推奨ライブラリ

2. **軽量性**
   - 追加依存関係最小（pg のみ）
   - バンドルサイズ最適化
   - メモリフットプリント小

3. **制御性**
   - 手動クエリによる完全制御
   - SQLの直接記述
   - パフォーマンス最適化の自由度

4. **既存アーキテクチャとの親和性**
   - ポート&アダプターパターンとの完全適合
   - リポジトリパターンの自然な実装
   - 依存性注入との統合容易性

5. **段階的移行適性**
   - 既存インターフェース完全継承
   - 並行稼働の容易性
   - テスト保護の維持

### 他技術との比較結果
- **Prisma**: 重厚、学習コスト高、既存アーキテクチャとの摩擦
- **Drizzle**: 軽量だが新しく、実績不足
- **pq**: 最適なバランス、実績と軽量性の両立

## 実装計画

### Phase 0: 基盤準備
**目標**: PostgreSQLアダプターの基盤実装

#### 1. PostgreSQLアダプター実装
```typescript
// src/infrastructure/adapters/output/persistence/PostgreSQLTaskRepository.ts
export class PostgreSQLTaskRepository implements TaskRepositoryPort {
  constructor(private pool: Pool) {}
  
  async save(task: Task): Promise<void> {
    // INSERT/UPDATE実装
  }
  
  async findById(id: TaskId): Promise<Task | null> {
    // SELECT実装
  }
  
  // 既存メソッド完全実装
}
```

#### 2. データベース設計
```sql
-- tasks テーブル
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL CHECK (status IN ('TODO', 'IN_PROGRESS', 'COMPLETED')),
  due_date TIMESTAMP,
  task_list_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- task_lists テーブル
CREATE TABLE task_lists (
  id UUID PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### 3. 接続設定
```typescript
// src/infrastructure/config/DatabaseConfig.ts
export const createDatabasePool = (): Pool => {
  return new Pool({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '54320'),
    database: process.env.DATABASE_NAME || 'devdb',
    user: process.env.DATABASE_USER || 'devuser',
    password: process.env.DATABASE_PASSWORD || 'devpass',
    max: 20, // 接続プールサイズ
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
};
```

#### 4. Docker Compose設定
既存の[`docker-compose.yml`](docker-compose.yml)を活用：
```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: devuser
      POSTGRES_PASSWORD: devpass
      POSTGRES_DB: devdb
    ports:
      - "54320:5432" # ホストから54320でアクセス
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql
```

### Phase 1: 段階的移行
**目標**: 既存テスト保護下での安全な移行

#### 1. 並行稼働体制
```typescript
// src/infrastructure/config/DependencyInjection.ts
export const createRepositories = () => {
  const useInMemoryDB = process.env.USE_IN_MEMORY_DB === 'true';
  
  if (useInMemoryDB) {
    return {
      taskRepository: new InMemoryTaskRepository(),
      taskListRepository: new InMemoryTaskListRepository(),
    };
  } else {
    const pool = createDatabasePool();
    return {
      taskRepository: new PostgreSQLTaskRepository(pool),
      taskListRepository: new PostgreSQLTaskListRepository(pool),
    };
  }
};
```

**環境変数設定:**
- `USE_IN_MEMORY_DB=true` → インメモリDB使用
- それ以外（`false`または未設定） → PostgreSQL使用

**動作仕様:**
- デフォルトでPostgreSQLを使用
- テストや開発時に`USE_IN_MEMORY_DB=true`を設定してインメモリDBに切り替え可能
- シンプルで理解しやすい設定

#### 2. 手動統合確認
PostgreSQL統合の動作確認は開発時の手動テストで実施：
- アプリケーション起動後の機能確認
- データ永続化の動作確認
- エラーハンドリングの動作確認
- パフォーマンスの基本確認

**既存143個テストは完全保護**: インメモリリポジトリでのテストのみ維持し、テスト実行時間と再現性を確保。

#### 3. マイグレーション戦略
- 機能単位での段階的切り替え
- ロールバック可能な設定
- データ整合性の継続監視

### Phase 2: 完全統合
**目標**: インメモリ実装の段階的削除

#### 1. インメモリ実装削除
- 段階的なファイル削除
- 依存関係の整理
- テストケースの統合

#### 2. パフォーマンス最適化
- クエリ最適化
- インデックス調整
- 接続プール調整

### Phase 3: 本格運用準備
**目標**: プロダクション対応

#### 1. 監視・ログ
- データベース接続監視
- クエリパフォーマンス監視
- エラーログ収集

#### 2. バックアップ・復旧
- 定期バックアップ設定
- 復旧手順確立
- 災害復旧計画

## トランザクション管理設計

### 集約境界に基づく設計
```typescript
// アプリケーションサービスレベルでのトランザクション制御
export class TaskApplicationService {
  async updateTask(dto: UpdateTaskDto): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      // Task集約内の操作
      const task = await this.taskRepository.findById(dto.id, client);
      task.update(dto);
      await this.taskRepository.save(task, client);
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
```

### エラーハンドリング戦略
- 接続エラー: 自動リトライ機構
- 制約違反: ドメインエラーへの変換
- タイムアウト: 適切なタイムアウト設定
- デッドロック: 自動リトライ

## 品質保証

### テスト戦略
1. **既存テスト完全保護**: 143個テスト100%通過維持（インメモリリポジトリのみ）
2. **手動統合確認**: PostgreSQL動作確認は開発時の手動テストで実施
3. **パフォーマンス確認**: 基本的なレスポンス時間確認（手動）
4. **品質維持**: データアクセステストはインメモリのみで時間短縮と再現性確保

### 移行検証
1. **データ整合性**: 移行前後のデータ比較
2. **機能検証**: 全機能の動作確認
3. **パフォーマンス検証**: レスポンス時間測定
4. **エラーハンドリング検証**: 異常系の動作確認

## リスク管理

### 技術リスク
- **データ損失**: バックアップ・復旧体制
- **パフォーマンス劣化**: 事前性能測定・最適化
- **接続障害**: 接続プール・リトライ機構

### 運用リスク
- **移行失敗**: ロールバック計画
- **データ不整合**: 整合性チェック機構
- **サービス停止**: 段階的移行による最小化

## 成功指標

### 技術指標
- ✅ 143個テスト100%通過維持
- ✅ 既存機能完全保持
- ✅ レスポンス時間維持（<100ms）
- ✅ データ整合性100%

### 品質指標
- ✅ アーキテクチャ品質維持
- ✅ コード品質維持
- ✅ 保守性向上
- ✅ 拡張性確保

## 実装開始準備完了
**Phase 0（基盤準備）の実装開始準備が完了**。詳細な技術仕様、実装計画、品質保証戦略が確立され、安全な PostgreSQL 統合への道筋が明確化。