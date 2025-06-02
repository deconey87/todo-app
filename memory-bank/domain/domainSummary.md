# ドメイン設計要約

## アーキテクチャ概要
**採用**: ポート&アダプターアーキテクチャ（適度な抽象化レベル）
- テスタビリティ重視、依存関係逆転による単体テスト容易化
- 明確な責務分離、変更影響範囲の限定
- リポジトリとWebインターフェースのみをポート化

## ドメインモデル
### エンティティ
- **Task**: タスク管理の中核（ID, title, description, dueDate, status, listId）
- **TaskList**: タスクグループ管理（ID, name）

### 値オブジェクト
- **Title/ListName**: 名称管理（空文字禁止、文字数制限）
- **Description**: 詳細内容（空文字許可、文字数制限）
- **DueDate**: 期日管理（日付形式、過去日付制限）
- **Status**: 進捗状況（未着手/進行中/完了）

### 集約設計
- **Task集約**: 個別タスクの一貫性保証
- **TaskList集約**: リスト情報の一貫性保証
- 独立した集約境界、相互参照はIDのみ

## 主要ユースケース（16個実装完了）
### タスク管理（UC001-009）
- 作成、閲覧、編集、削除、ステータス変更
- フィルタリング、ソート機能

### タスクリスト管理（UC010-016）
- リスト作成、編集、削除
- タスクのリスト間移動

## 技術実装
### ポート定義
- **入力ポート**: TaskManagementPort, TaskListManagementPort
- **出力ポート**: TaskRepositoryPort, TaskListRepositoryPort, TimeProvider

### アプリケーションサービス
- TaskApplicationService, TaskListApplicationService
- DTO変換、ビジネスルール検証、永続化調整

### 依存性注入
- DependencyContainerによる一元管理
- テスト時のモック化対応

## 実装状況
- ✅ 全16ユースケース完了
- ✅ 143個テストケース（100%通過）
- ✅ DDD原則準拠
- ✅ Status型統一（87.5%削減）
- ✅ アーキテクチャ整合性確立