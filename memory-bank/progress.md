# 進捗状況

## 完了済み
- 開発環境の整備が完了した。
- Next.jsのインストールが完了した。
- 戦略的設計が完了した。
- Vitestの導入が完了した。
- **戦術的設計が完了した。**
- **ポート&アダプターアーキテクチャの設計が完了した。**
- **CreateTaskListUseCaseの実装が完了した。**
- **残りのユースケース（UC008, UC009, UC012, UC013, UC016）の実装が完了した。**

## 実装詳細
### アプリケーションサービス層
- ✅ DTO定義（CreateTaskListDto, TaskListDto, TaskDto, CreateTaskDto, UpdateTaskDto）
- ✅ ポート定義（入力・出力ポート）
- ✅ TaskListApplicationService（UC010, UC011, UC013対応）
- ✅ TaskApplicationService（UC001-UC009, UC016対応）
- ✅ エラーハンドリング（ApplicationError階層）
- ✅ 依存性注入設定（DependencyContainer）

### ドメイン層
- ✅ Task エンティティ（moveToListメソッド追加）
- ✅ TaskList エンティティ
- ✅ 値オブジェクト（Title, Description, DueDate, Status, ListName）
- ✅ ドメインサービス

### インフラストラクチャ層
- ✅ インメモリリポジトリ（InMemoryTaskListRepository, InMemoryTaskRepository）
- ✅ Next.js API Routes統合
- ✅ テストページ作成

### 実装済みユースケース
- ✅ UC001: 新しいタスクを作成する
- ✅ UC002: タスク一覧を表示する
- ✅ UC003: タスク詳細を表示する
- ✅ UC004: タスクを更新する
- ✅ UC005: タスクを削除する
- ✅ UC006: タスクを完了にする
- ✅ UC007: タスクを未完了に戻す
- ✅ UC008: タスクをステータスでフィルタリングする
- ✅ UC009: タスクを期日でソートする
- ✅ UC010: 新しいタスクリストを作成する
- ✅ UC011: タスクリスト一覧を表示する
- ✅ UC012: 特定のタスクリストにタスクを追加する（既存のcreateTaskで対応）
- ✅ UC013: 特定のタスクリスト内のタスク一覧を表示する
- ✅ UC016: タスクを別のタスクリストに移動する

### 新規実装機能
- ✅ `getTasksByStatus(status: string)` - ステータスでタスクをフィルタリング
- ✅ `getTasksSortedByDueDate(ascending: boolean)` - 期日でタスクをソート
- ✅ `moveTaskToList(taskId: string, newListId: string)` - タスクの移動
- ✅ `getTasksByListId(listId: string)` - 特定リスト内のタスク取得

### テスト
- ✅ 単体テスト（116/116テストケース通過）
- ✅ 新機能のテストケース追加
- ✅ 動作確認完了
- ✅ DDD改善後のテスト（2024/6/2）
- ✅ リファクタリング後のテスト（2024/6/2）

### DDD改善（2024/6/2）
- ✅ TaskList集約の境界違反修正
- ✅ TaskListからTask関連メソッド削除（addTask, removeTask, getTaskById, tasks getter）
- ✅ 集約間の参照をIDベースに変更
- ✅ テストケースの適切な修正（7個のTask関連テストを削除）

### 重複コード共通化リファクタリング（2024/6/2）
- ✅ TaskDtoMapperクラス作成（src/application/dto/TaskDtoMapper.ts）
- ✅ TaskApplicationServiceの重複メソッド削除（toDto, mapFromStatusEnum）
- ✅ TaskListApplicationServiceの重複メソッド削除（taskToDto, mapFromStatusEnum）
- ✅ DRY原則の適用（Don't Repeat Yourself）
- ✅ 単一責任原則の適用（DTOマッピングの責務分離）
- ✅ TaskDtoMapperのテストケース追加（7個のテスト）
- ✅ 既存テストの継続通過確認（116/116テスト成功）

## 現在の状況
全16のユースケースが実装完了（UC014, UC015も実装済み）。DDD原則に従った適切な集約境界を持つポート&アダプターアーキテクチャによる堅牢な設計で、タスク管理の全機能が動作する状態。重複コードの共通化リファクタリングも完了し、保守性とテスタビリティが向上。

## 次の候補
- PostgreSQL統合
- フロントエンドUI改善
- API Routesの拡張
- プロダクション環境への展開準備