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
- ✅ 単体テスト（103/103テストケース通過）
- ✅ 新機能のテストケース追加
- ✅ 動作確認完了

## 現在の状況
全16のユースケースのうち15が実装完了（UC014, UC015は未実装）。ポート&アダプターアーキテクチャによる堅牢な設計で、タスク管理の主要機能が動作する状態。

## 次の候補
- UC014: タスクリストの名前を変更する
- UC015: タスクリストを削除する（関連タスクも削除）
- PostgreSQL統合
- フロントエンドUI改善
- API Routesの拡張