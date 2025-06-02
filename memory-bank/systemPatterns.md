# システムパターン

## アーキテクチャ概要
ドメイン駆動設計（DDD）をベースにしたポート&アダプターアーキテクチャを採用。依存関係の方向を制御し、ビジネスロジックの独立性を確保。

## 核となる設計パターン

### ドメイン層パターン
- **エンティティパターン**: [`Task`](src/domain/task/Task.ts), [`TaskList`](src/domain/taskList/TaskList.ts)
- **値オブジェクトパターン**: [`Title`](src/domain/task/Title.vo.ts), [`Description`](src/domain/task/Description.vo.ts), [`DueDate`](src/domain/task/DueDate.vo.ts), [`Status`](src/domain/task/Status.vo.ts), [`ListName`](src/domain/taskList/ListName.vo.ts)
- **リポジトリパターン**: [`TaskRepository`](src/domain/task/TaskRepository.ts), [`TaskListRepository`](src/domain/taskList/TaskListRepository.ts)
- **ブランド型パターン**: 型安全性向上（[`types.ts`](src/domain/shared/types.ts)）
- **統一型管理パターン**: [`TaskStatus.ts`](src/shared/types/TaskStatus.ts)による型定義の一元化

### アプリケーション層パターン
- **ポートパターン**: 入力ポート（[`TaskManagementPort`](src/application/ports/input/TaskManagementPort.ts), [`TaskListManagementPort`](src/application/ports/input/TaskListManagementPort.ts)）、出力ポート（[`TaskRepositoryPort`](src/application/ports/output/TaskRepositoryPort.ts), [`TaskListRepositoryPort`](src/application/ports/output/TaskListRepositoryPort.ts), [`TimeProvider`](src/application/ports/output/TimeProvider.ts)）
- **アプリケーションサービスパターン**: [`TaskApplicationService`](src/application/services/TaskApplicationService.ts), [`TaskListApplicationService`](src/application/services/TaskListApplicationService.ts)
- **DTOパターン**: [`TaskDto`](src/application/dto/TaskDto.ts), [`TaskListDto`](src/application/dto/TaskListDto.ts), [`CreateTaskDto`](src/application/dto/CreateTaskDto.ts), [`UpdateTaskDto`](src/application/dto/UpdateTaskDto.ts), [`CreateTaskListDto`](src/application/dto/CreateTaskListDto.ts)
- **マッパーパターン**: [`TaskDtoMapper`](src/application/dto/TaskDtoMapper.ts)
- **変換処理統一パターン**: `TaskStatusConverter`クラスによる型変換の一元化

### インフラストラクチャ層パターン
- **アダプターパターン**: [`InMemoryTaskRepository`](src/infrastructure/adapters/output/persistence/InMemoryTaskRepository.ts), [`InMemoryTaskListRepository`](src/infrastructure/adapters/output/persistence/InMemoryTaskListRepository.ts), [`SystemTimeProvider`](src/infrastructure/adapters/output/time/SystemTimeProvider.ts)
- **ファクトリーパターン**: [`DependencyInjection`](src/infrastructure/config/DependencyInjection.ts)
- **依存性注入パターン**: コンストラクタインジェクション

## 重要な設計決定

### 集約設計
- **TaskとTaskListの独立性**: 各集約は独立してライフサイクルを管理
- **IDベース参照**: 集約間の直接参照を避け、IDによる参照を採用
- **境界の明確化**: 各集約の責務と不変条件を明確に定義

### 依存関係の制御
- **ポートパターン**: インターフェースによる抽象化
- **依存性注入**: コンストラクタインジェクションによる疎結合
- **ファクトリーパターン**: オブジェクト生成の責務分離

### テスタビリティの確保
- **時刻注入**: [`TimeProvider`](src/application/ports/output/TimeProvider.ts)による時間依存処理の制御
- **モック化**: ポートインターフェースによる外部依存の抽象化
- **状態分離**: ファクトリーパターンによるテスト間の独立性確保

### 型安全性の強化
- **ブランド型**: [`types.ts`](src/domain/shared/types.ts)による型レベルでの制約表現
- **値オブジェクト**: ドメイン概念の型安全な表現
- **統一型定義**: [`TaskStatus.ts`](src/shared/types/TaskStatus.ts)による型の一元管理
- **変換処理統一**: `TaskStatusConverter`による安全な型変換
- **静的型チェック**: TypeScriptによるコンパイル時エラー検出

## アーキテクチャの利点

### 保守性
- **明確な責務分離**: 各層・各クラスの役割が明確
- **変更の局所化**: 影響範囲を限定した修正が可能
- **テストの容易さ**: 単体テストが書きやすい構造

### 拡張性
- **新機能追加**: 既存コードへの影響を最小化
- **技術変更**: アダプターの交換による技術スタック変更
- **ビジネスロジック進化**: ドメイン層の独立性による柔軟な対応

### 品質指標
- **テストカバレッジ**: 143個のテストケース（100%通過）
- **型安全性**: 統一型定義による大幅向上（87.5%削減）
- **保守性**: 型定義の一元化による改善
- **コード品質**: SOLID原則、DRY原則の適用
- **アーキテクチャ整合性**: DDD原則に準拠した設計

## 新規導入パターン（2025/6/2）

### 統一型管理パターン
- **目的**: 重複する型定義の一元化と保守性向上
- **実装**: [`TaskStatus.ts`](src/shared/types/TaskStatus.ts)による統一型定義
- **効果**: 型定義箇所を8箇所から1箇所に削減（87.5%削減）

### 変換処理統一パターン
- **目的**: 型変換処理の一元化と安全性確保
- **実装**: `TaskStatusConverter`クラスによる変換処理統一
- **効果**: ドメイン層enumと他層の完全統合、変換エラーの防止

### 型安全性保護パターン
- **目的**: リファクタリング時の既存機能保護
- **実装**: [`TaskStatus.test.ts`](src/shared/types/TaskStatus.test.ts)による包括的テスト
- **効果**: 25個の新規テストケースによる変換処理の完全保護