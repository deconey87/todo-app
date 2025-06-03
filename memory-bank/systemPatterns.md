# システムパターン

## アーキテクチャ概要
ドメイン駆動設計（DDD）をベースにしたポート&アダプターアーキテクチャ。依存関係の方向を制御し、ビジネスロジックの独立性を確保。

## 確立された設計パターン

### ドメイン層パターン
- **エンティティ**: Task, TaskList（一意識別子、ライフサイクル管理）
- **値オブジェクト**: Title, Description, DueDate, Status, ListName（不変、検証ロジック）
- **リポジトリ**: TaskRepository, TaskListRepository（永続化抽象化）
- **ブランド型**: 型安全性向上（[`types.ts`](src/domain/shared/types.ts)）
- **統一型管理**: [`TaskStatus.ts`](src/shared/types/TaskStatus.ts)による一元化（87.5%削減）

### アプリケーション層パターン
- **ポート**: 入力ポート（TaskManagementPort, TaskListManagementPort）、出力ポート（Repository, TimeProvider）
- **アプリケーションサービス**: TaskApplicationService, TaskListApplicationService
- **DTO**: TaskDto, CreateTaskDto, UpdateTaskDto等
- **マッパー**: TaskDtoMapper（ドメイン↔DTO変換）
- **変換処理統一**: TaskStatusConverter（型変換一元化）

### インフラストラクチャ層パターン
- **アダプター**: InMemoryRepository, SystemTimeProvider
- **ファクトリー**: DependencyInjection（オブジェクト生成管理）
- **依存性注入**: コンストラクタインジェクション

## UIデザインパターン（2025/6/2確立）

### モダンミニマル原則
- **装飾削減**: 不要な視覚的要素の排除
- **機能的美しさ**: 機能性を損なわない美的追求
- **セマンティック重視**: HTML要素の意味的正確性

### Card削除戦略
- **判断基準**: 単独表示→Card不要、リスト項目→li要素、コンテナ→セマンティックHTML
- **代替手法**: 線区切り（border-bottom）、背景色階層（surface-1/2/3）、タイポグラフィ

### 階層的背景色システム
- `--surface-1`: 最上位背景
- `--surface-2`: 中間背景  
- `--surface-3`: 深い背景
- 視覚的深度に応じた段階的適用

### セマンティックHTML強化
- `<header>`: ページヘッダー（DashboardHeader）
- `<aside>`: サイドバー（TaskListSidebar）
- `<section>`: コンテンツ区分（TaskList）
- `<ul>` + `<li>`: リスト構造（TaskItem）

### タイポグラフィスケール
- `.text-display`: 最大見出し（24px, bold）
- `.text-heading`: 主見出し（20px, semibold）
- `.text-subheading`: 副見出し（16px, medium）
- `.text-body`: 本文（14px, normal）

## 重要な設計決定

### 集約設計
- TaskとTaskListの独立性維持
- IDベース参照（集約間の直接参照回避）
- 境界の明確化（責務と不変条件）

### テスタビリティ確保
- 時刻注入（TimeProvider）
- モック化（ポートインターフェース）
- 状態分離（ファクトリーパターン）

### 型安全性強化
- ブランド型による制約表現
- 統一型定義による一元管理
- 変換処理統一（TaskStatusConverter）
- 静的型チェック（TypeScript）

## 品質指標（バックエンド層）
- **テストケース**: 143個（100%通過）
- **型安全性**: 統一型定義による大幅向上（87.5%削減）
- **アーキテクチャ整合性**: DDD原則完全準拠
- **バックエンド完成度**: 95%（高品質）

## UI統合の課題
- **統合度**: 30%完了（多数の未統合機能）
- **ユーザビリティ**: 実際に利用できる機能が限定的
- **エントリーポイント**: メインページ未実装

## 実装効果（確立済みパターン）
### 保守性
- 明確な責務分離、変更の局所化、テストの容易さ

### 拡張性
- 新機能追加時の影響最小化、技術変更の柔軟性

### UI統合時の指針
- 既存Server Actionsの活用、確立されたデザインパターンの適用
- セマンティックHTML + ミニマルデザインの継続