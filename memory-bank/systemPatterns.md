# システムパターン

## アーキテクチャ概要
ドメイン駆動設計（DDD）をベースにしたポート&アダプターアーキテクチャ（ヘキサゴナルアーキテクチャ）を採用。クリーンアーキテクチャの原則に従い、依存関係の方向を制御し、ビジネスロジックの独立性を確保。

## 層構造とパターン

### ドメイン層（Core）
- **エンティティパターン**: [`Task`](src/domain/task/Task.ts), [`TaskList`](src/domain/taskList/TaskList.ts)
- **値オブジェクトパターン**: [`Title`](src/domain/task/Title.vo.ts), [`Description`](src/domain/task/Description.vo.ts), [`DueDate`](src/domain/task/DueDate.vo.ts), [`Status`](src/domain/task/Status.vo.ts), [`ListName`](src/domain/taskList/ListName.vo.ts)
- **リポジトリパターン**: [`TaskRepository`](src/domain/task/TaskRepository.ts), [`TaskListRepository`](src/domain/taskList/TaskListRepository.ts)
- **ブランド型パターン**: 型安全性向上のための独自型定義（[`types.ts`](src/domain/shared/types.ts)）

### アプリケーション層（Use Cases）
- **アプリケーションサービスパターン**: [`TaskApplicationService`](src/application/services/TaskApplicationService.ts), [`TaskListApplicationService`](src/application/services/TaskListApplicationService.ts)
- **ポートパターン**: 入力ポート（[`TaskManagementPort`](src/application/ports/input/TaskManagementPort.ts), [`TaskListManagementPort`](src/application/ports/input/TaskListManagementPort.ts)）、出力ポート（[`TaskRepositoryPort`](src/application/ports/output/TaskRepositoryPort.ts), [`TaskListRepositoryPort`](src/application/ports/output/TaskListRepositoryPort.ts), [`TimeProvider`](src/application/ports/output/TimeProvider.ts)）
- **DTOパターン**: データ転送オブジェクト（[`TaskDto`](src/application/dto/TaskDto.ts), [`TaskListDto`](src/application/dto/TaskListDto.ts), [`CreateTaskDto`](src/application/dto/CreateTaskDto.ts), [`UpdateTaskDto`](src/application/dto/UpdateTaskDto.ts), [`CreateTaskListDto`](src/application/dto/CreateTaskListDto.ts)）
- **マッパーパターン**: [`TaskDtoMapper`](src/application/dto/TaskDtoMapper.ts) - DTOマッピング責務の分離

### インフラストラクチャ層（Adapters）
- **アダプターパターン**: [`InMemoryTaskRepository`](src/infrastructure/adapters/output/persistence/InMemoryTaskRepository.ts), [`InMemoryTaskListRepository`](src/infrastructure/adapters/output/persistence/InMemoryTaskListRepository.ts), [`SystemTimeProvider`](src/infrastructure/adapters/output/time/SystemTimeProvider.ts)
- **ファクトリーパターン**: [`DependencyInjection`](src/infrastructure/config/DependencyInjection.ts) - 依存性注入コンテナの生成
- **依存性注入パターン**: コンストラクタインジェクション

### プレゼンテーション層（UI）
- **Next.js**: React フレームワーク
- **API Routesパターン**: RESTful API エンドポイント（[`/api/task-lists`](app/api/task-lists/route.ts), [`/api/task-lists/[id]`](app/api/task-lists/[id]/route.ts)）

## 設計原則の適用

### SOLID原則
1. **単一責任原則（SRP）**: 各クラスは単一の責務を持つ
   - [`TaskDtoMapper`](src/application/dto/TaskDtoMapper.ts): DTOマッピング専用
   - 値オブジェクト: 各々が特定のドメイン概念を表現
2. **開放閉鎖原則（OCP）**: 拡張に開放、修正に閉鎖
   - ポートパターンによる抽象化
3. **リスコフ置換原則（LSP）**: 派生クラスは基底クラスと置換可能
   - インターフェース実装の一貫性
4. **インターフェース分離原則（ISP）**: クライアントは不要なインターフェースに依存しない
   - 細分化されたポートインターフェース
5. **依存関係逆転原則（DIP）**: 高レベルモジュールは低レベルモジュールに依存しない
   - [`TimeProvider`](src/application/ports/output/TimeProvider.ts)による時刻注入

### DDD原則
- **集約境界の明確化**: TaskListとTaskは独立した集約
- **集約間の参照**: IDベースの参照（直接参照を避ける）
- **ドメインサービス**: 複雑なビジネスロジックの実装
- **値オブジェクト**: 不変性とドメイン概念の表現

### その他の原則
- **DRY原則**: 重複コードの除去（[`TaskDtoMapper`](src/application/dto/TaskDtoMapper.ts)による共通化）
- **関心の分離**: 各層の責務を明確に分離
- **依存関係の制御**: 依存関係の方向を内側（ドメイン）に向ける

## 導入された設計パターン

### 1. ファクトリーパターン
- **実装**: [`DependencyInjection`](src/infrastructure/config/DependencyInjection.ts)
- **目的**: Singletonパターンを除去し、テスト間の状態分離を改善
- **効果**: 並列テスト実行の安全性向上

### 2. 依存性注入パターン
- **実装**: コンストラクタインジェクション
- **目的**: 依存関係の逆転、テスタビリティ向上
- **効果**: モックオブジェクトによるテストの容易化

### 3. 時刻注入パターン
- **実装**: [`TimeProvider`](src/application/ports/output/TimeProvider.ts)インターフェース
- **目的**: 時間依存処理のテスタビリティ向上
- **効果**: 固定時刻でのテスト実行、テストの安定化

### 4. ブランド型パターン
- **実装**: [`types.ts`](src/domain/shared/types.ts)
- **目的**: 型安全性向上、コンパイル時エラー検出
- **効果**: ドメインモデルの表現力向上

### 5. マッパーパターン
- **実装**: [`TaskDtoMapper`](src/application/dto/TaskDtoMapper.ts)
- **目的**: DTOマッピング責務の分離、重複コード除去
- **効果**: 保守性向上、単一責任原則の適用

## アーキテクチャ品質指標

### テスタビリティ
- **テストケース数**: 118個
- **テスト通過率**: 100%
- **時間依存テスト**: 安定化済み（固定時刻使用）
- **並列テスト実行**: 安全性確保

### 保守性
- **重複コード**: 除去済み（DRY原則適用）
- **責務分離**: 明確化済み（単一責任原則適用）
- **依存関係**: 制御済み（依存関係逆転原則適用）

### 拡張性
- **ポートパターン**: 新しいアダプターの追加が容易
- **ファクトリーパターン**: 新しい依存関係の追加が容易
- **集約境界**: 新しいドメイン概念の追加が容易

### 型安全性
- **ブランド型**: コンパイル時エラー検出強化
- **値オブジェクト**: ドメイン制約の型レベル表現
- **TypeScript**: 静的型チェック

## 技術スタック
- **UI層**: Next.js（React フレームワーク）
- **データ永続化**: PostgreSQL（将来実装予定）、現在はインメモリリポジトリ
- **テスト**: Vitest
- **言語**: TypeScript
- **アーキテクチャ**: ポート&アダプター（ヘキサゴナル）+ DDD