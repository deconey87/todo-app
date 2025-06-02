# システムパターン

## アーキテクチャ概要
ドメイン駆動設計（DDD）をベースにしたポート&アダプターアーキテクチャを採用。依存関係の方向を制御し、ビジネスロジックの独立性を確保。

## 核となる設計パターン

### ドメイン層パターン
- **エンティティパターン**: [`Task`](src/domain/task/Task.ts), [`TaskList`](src/domain/taskList/TaskList.ts)
- **値オブジェクトパターン**: [`Title`](src/domain/task/Title.vo.ts), [`Description`](src/domain/task/Description.vo.ts), [`DueDate`](src/domain/task/DueDate.vo.ts), [`Status`](src/domain/task/Status.vo.ts), [`ListName`](src/domain/taskList/ListName.vo.ts)
- **リポジトリパターン**: [`TaskRepository`](src/domain/task/TaskRepository.ts), [`TaskListRepository`](src/domain/taskList/TaskListRepository.ts)
- **ブランド型パターン**: 型安全性向上（[`types.ts`](src/domain/shared/types.ts)）

### アプリケーション層パターン
- **ポートパターン**: 入力ポート（[`TaskManagementPort`](src/application/ports/input/TaskManagementPort.ts), [`TaskListManagementPort`](src/application/ports/input/TaskListManagementPort.ts)）、出力ポート（[`TaskRepositoryPort`](src/application/ports/output/TaskRepositoryPort.ts), [`TaskListRepositoryPort`](src/application/ports/output/TaskListRepositoryPort.ts), [`TimeProvider`](src/application/ports/output/TimeProvider.ts)）
- **アプリケーションサービスパターン**: [`TaskApplicationService`](src/application/services/TaskApplicationService.ts), [`TaskListApplicationService`](src/application/services/TaskListApplicationService.ts)
- **DTOパターン**: [`TaskDto`](src/application/dto/TaskDto.ts), [`TaskListDto`](src/application/dto/TaskListDto.ts), [`CreateTaskDto`](src/application/dto/CreateTaskDto.ts), [`UpdateTaskDto`](src/application/dto/UpdateTaskDto.ts), [`CreateTaskListDto`](src/application/dto/CreateTaskListDto.ts)
- **マッパーパターン**: [`TaskDtoMapper`](src/application/dto/TaskDtoMapper.ts)

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
- **テストカバレッジ**: 118個のテストケース（100%通過）
- **コード品質**: SOLID原則、DRY原則の適用
- **アーキテクチャ整合性**: DDD原則に準拠した設計