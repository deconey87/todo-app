# UI層統合計画（実装状況反映版）

## 概要

**現在の実装状況**（2025/6/3時点）：
- **バックエンド層**: 95%完了（高品質、DDD原則準拠、143テスト100%通過）
- **UI統合層**: 30%完了（基本機能のみ、多数の未統合機能）
- **緊急課題**: メインページ未実装、CRUD操作UI大部分未実装

本計画は実際の実装進捗を反映し、既存の高品質なバックエンド実装を活用した段階的UI統合戦略を策定する。

## 1. アーキテクチャ構成

```mermaid
graph TD
    A[Next.js App Router] --> B[Server Components]
    B --> C[Server Actions]
    C --> D[Application Services]
    D --> E[Domain Layer]
    
    F[Client Components] --> G[Interactive Features]
    G --> C
    
    H[shadcn/ui] --> B
    H --> F
```

## 2. 現在の実装状況と課題

### 実装済み機能（UIから利用可能）
- ✅ **タスク一覧表示**: [`/dashboard`](app/dashboard/page.tsx)でタスク表示
- ✅ **ステータス変更**: TODO → 進行中 → 完了の操作
- ✅ **フィルタリング**: タスクリスト別・ステータス別フィルタ
- ✅ **基本UI**: shadcn/ui + 階層的デザインシステム

### 緊急対応が必要な項目
- ❌ **メインページ**: [`app/page.tsx`](app/page.tsx)がNext.jsサンプルのまま
- ❌ **タスク作成UI**: [`createTaskAction`](app/actions/task-actions.ts:7)は実装済み、UI未統合
- ❌ **タスクリスト作成UI**: [`createTaskListAction`](app/actions/task-list-actions.ts:6)は実装済み、UI未統合
- ❌ **タスクリスト削除UI**: [`deleteTaskListAction`](app/actions/task-list-actions.ts:18)は実装済み、UI未統合
- ❌ **タスク移動UI**: [`moveTaskAction`](app/actions/task-actions.ts:30)は実装済み、UI未統合

### 完全未実装機能
- ❌ **タスク編集**: Server Action・UI共に未実装
- ❌ **タスク削除**: Server Action・UI共に未実装
- ❌ **タスクリスト名変更**: Server Action・UI共に未実装

### 既存資産の活用方針
- **高品質バックエンド**: DDD原則準拠、143テスト100%通過の実装を維持
- **既存Server Actions**: 実装済みの5つのServer Actionsを最優先で統合
- **確立されたデザインシステム**: 階層的背景色・セマンティックHTML構造を継承
- **型安全性**: [`TaskStatus.ts`](src/shared/types/TaskStatus.ts)による統一型管理を活用

## 3. 設計方針
- **Server Components**: 静的コンテンツとデータ表示
- **Client Components**: インタラクティブ機能のみに限定
- **Server Actions**: API Routesを使わず直接アプリケーションサービス呼び出し
- **URLパラメータ**: 状態管理とフィルタリング
- **段階的統合**: 既存実装を活用した現実的な開発計画

## 4. Server Components vs Client Components分類

### Server Components（サーバーサイドレンダリング）
- **DashboardPage** - メインページレイアウト
- **TaskListSidebar** - タスクリスト一覧表示
- **TaskList** - タスク一覧表示
- **TaskItem** - 個別タスク表示（静的部分）
- **FilteredTaskList** - フィルタリング済みタスク表示

### Client Components（インタラクティブ機能のみ）
- **TaskDragDropContainer** - ドラッグ&ドロップ機能
- **TaskFormModal** - タスク作成・編集フォーム
- **TaskListFormModal** - タスクリスト作成・編集フォーム
- **SidebarToggle** - サイドバー開閉
- **FilterControls** - リアルタイムフィルタリング

## 5. Server Actions実装状況

### 実装済みServer Actions
以下のServer Actionsは既に実装済みで、UI統合のみが必要：

```typescript
// app/actions/task-actions.ts
✅ createTaskAction(formData: FormData)     // タスク作成
✅ updateTaskStatusAction(taskId, status)   // ステータス変更（UI統合済み）
✅ moveTaskAction(taskId, newListId)        // タスク移動

// app/actions/task-list-actions.ts
✅ createTaskListAction(formData: FormData) // タスクリスト作成
✅ deleteTaskListAction(listId: string)     // タスクリスト削除
```

### 未実装Server Actions
以下は新規実装が必要：

```typescript
// 実装が必要なServer Actions
❌ updateTaskAction(taskId, formData)       // タスク編集
❌ deleteTaskAction(taskId: string)         // タスク削除
❌ updateTaskListAction(listId, formData)   // タスクリスト名変更
```

## 6. Server Actions設計（参考実装）

### タスク関連Actions

```typescript
// app/actions/task-actions.ts
'use server'

import { createDependencyContainer } from '@/src/infrastructure/config/DependencyInjection';
import { revalidatePath } from 'next/cache';

export async function createTaskAction(formData: FormData) {
  const container = createDependencyContainer();
  const taskService = container.taskApplicationService;
  
  const result = await taskService.createTask({
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    dueDate: formData.get('dueDate') as string,
    listId: formData.get('listId') as string,
  });
  
  revalidatePath('/dashboard');
  return result;
}

export async function updateTaskStatusAction(taskId: string, status: string) {
  const container = createDependencyContainer();
  const taskService = container.taskApplicationService;
  
  await taskService.changeTaskStatus(taskId, status as any);
  revalidatePath('/dashboard');
}

export async function moveTaskAction(taskId: string, newListId: string) {
  const container = createDependencyContainer();
  const taskService = container.taskApplicationService;
  
  await taskService.moveTaskToList(taskId, newListId);
  revalidatePath('/dashboard');
}
```

### タスクリスト関連Actions

```typescript
// app/actions/task-list-actions.ts
'use server'

export async function createTaskListAction(formData: FormData) {
  const container = createDependencyContainer();
  const taskListService = container.taskListApplicationService;
  
  const result = await taskListService.createTaskList({
    name: formData.get('name') as string,
  });
  
  revalidatePath('/dashboard');
  return result;
}

export async function deleteTaskListAction(listId: string) {
  const container = createDependencyContainer();
  const taskListService = container.taskListApplicationService;
  
  await taskListService.deleteTaskListWithTasks(listId);
  revalidatePath('/dashboard');
}
```

## 7. URL設計とSearchParams活用

```
/dashboard                           # デフォルト表示
/dashboard?list=:id                  # 特定タスクリスト選択
/dashboard?filter=:status            # ステータスフィルタ
/dashboard?sort=:order               # ソート順
/dashboard?list=:id&filter=:status   # 組み合わせ
```

## 8. メインページ構成

```typescript
// app/dashboard/page.tsx (Server Component)
interface DashboardPageProps {
  searchParams: {
    list?: string;
    filter?: string;
    sort?: string;
  };
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const container = createDependencyContainer();
  const taskListService = container.taskListApplicationService;
  const taskService = container.taskApplicationService;
  
  // サーバーサイドでデータ取得
  const taskLists = await taskListService.getAllTaskLists();
  const selectedListId = searchParams.list || taskLists[0]?.id;
  
  let tasks = [];
  if (selectedListId) {
    if (searchParams.filter) {
      tasks = await taskService.getTasksByStatus(searchParams.filter);
    } else {
      tasks = await taskService.getTasksByListId(selectedListId);
    }
    
    if (searchParams.sort === 'dueDate') {
      tasks = await taskService.getTasksSortedByDueDate(true);
    }
  }
  
  return (
    <div className="flex h-screen">
      <TaskListSidebar 
        taskLists={taskLists} 
        selectedListId={selectedListId} 
      />
      <main className="flex-1">
        <DashboardHeader />
        <TaskDragDropContainer>
          <TaskList 
            tasks={tasks} 
            selectedListId={selectedListId}
            filter={searchParams.filter}
          />
        </TaskDragDropContainer>
      </main>
    </div>
  );
}
```

## 9. Client Component実装例

### ドラッグ&ドロップコンテナ

```typescript
// components/TaskDragDropContainer.tsx
'use client'

import { moveTaskAction } from '@/app/actions/task-actions';

export function TaskDragDropContainer({ children }: { children: React.ReactNode }) {
  const handleDrop = async (taskId: string, newListId: string) => {
    await moveTaskAction(taskId, newListId);
  };
  
  return (
    <div onDrop={handleDrop}>
      {children}
    </div>
  );
}
```

### フィルタリングコントロール

```typescript
// components/FilterControls.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation';

export function FilterControls() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const handleFilterChange = (status: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('filter', status);
    router.push(`/dashboard?${params.toString()}`);
  };
  
  return (
    <div>
      <button onClick={() => handleFilterChange('TODO')}>TODO</button>
      <button onClick={() => handleFilterChange('IN_PROGRESS')}>進行中</button>
      <button onClick={() => handleFilterChange('DONE')}>完了</button>
    </div>
  );
}
```

## 10. ディレクトリ構造

```
app/
├── dashboard/
│   └── page.tsx                 # メインダッシュボード（Server Component）
├── actions/
│   ├── task-actions.ts          # タスク関連Server Actions
│   └── task-list-actions.ts     # タスクリスト関連Server Actions
└── globals.css

components/
├── server/                      # Server Components
│   ├── TaskList.tsx
│   ├── TaskItem.tsx
│   ├── TaskListSidebar.tsx
│   └── DashboardHeader.tsx
├── client/                      # Client Components
│   ├── TaskDragDropContainer.tsx
│   ├── TaskFormModal.tsx
│   ├── FilterControls.tsx
│   └── SidebarToggle.tsx
└── ui/                         # shadcn/ui components
    ├── button.tsx
    ├── card.tsx
    └── ...
```

## 11. 画面レイアウト設計

### ダッシュボード構成

```mermaid
graph LR
    subgraph "メイン画面 (/dashboard)"
        A[サイドバー<br/>タスクリスト管理<br/>300px] --> B[メインエリア<br/>タスク表示・操作<br/>残り幅]
        C[ヘッダー<br/>フィルタ・ソート<br/>60px] --> B
    end
```

### レスポンシブ対応

```mermaid
graph LR
    A[Desktop<br/>1024px+] --> B[サイドバー固定表示]
    C[Tablet<br/>768-1023px] --> D[サイドバー折りたたみ可能]
    E[Mobile<br/>~767px] --> F[ハンバーガーメニュー]
```

## 12. 状態管理戦略

### Server State（Server Components）
- URLパラメータによる状態管理
- `revalidatePath()`による再レンダリング
- サーバーサイドでのデータ取得

### Client State（最小限）
- フォームの入力状態
- UI状態（モーダル開閉、サイドバー表示）
- ドラッグ&ドロップの一時状態

## 13. ユースケースマッピング（実装状況反映）

| ユースケース | 実装状況 | Server Action | UI統合 | コンポーネント |
|-------------|----------|---------------|--------|---------------|
| UC001: タスク作成 | 🔄 部分実装 | ✅ [`createTaskAction`](app/actions/task-actions.ts:7) | ❌ 未実装 | TaskFormModal |
| UC002: タスク一覧表示 | ✅ 実装済み | - | ✅ 実装済み | [`TaskList`](components/server/TaskList.tsx) |
| UC003: タスク詳細表示 | ✅ 実装済み | - | ✅ 実装済み | [`TaskItem`](components/server/TaskItem.tsx) |
| UC004: タスク更新 | ❌ 未実装 | ❌ 未実装 | ❌ 未実装 | TaskFormModal |
| UC005: タスク削除 | ❌ 未実装 | ❌ 未実装 | ❌ 未実装 | TaskItem |
| UC006-007: ステータス変更 | ✅ 実装済み | ✅ [`updateTaskStatusAction`](app/actions/task-actions.ts:22) | ✅ 実装済み | [`TaskItem`](components/server/TaskItem.tsx) |
| UC008: ステータスフィルタ | ✅ 実装済み | - | ✅ 実装済み | [`DashboardPage`](app/dashboard/page.tsx) |
| UC009: 期日ソート | ❌ 未実装 | - | ❌ 未実装 | SortControls |
| UC010: タスクリスト作成 | 🔄 部分実装 | ✅ [`createTaskListAction`](app/actions/task-list-actions.ts:6) | ❌ 未実装 | TaskListFormModal |
| UC011: タスクリスト一覧 | 🔄 部分実装 | - | 🔄 部分実装 | [`TaskListSidebar`](components/server/TaskListSidebar.tsx) |
| UC012: リスト内タスク追加 | 🔄 部分実装 | ✅ [`createTaskAction`](app/actions/task-actions.ts:7) | ❌ 未実装 | TaskFormModal |
| UC013: リスト内タスク表示 | 🔄 部分実装 | - | 🔄 部分実装 | [`TaskList`](components/server/TaskList.tsx) |
| UC014: リスト名変更 | ❌ 未実装 | ❌ 未実装 | ❌ 未実装 | TaskListFormModal |
| UC015: リスト削除 | 🔄 部分実装 | ✅ [`deleteTaskListAction`](app/actions/task-list-actions.ts:18) | ❌ 未実装 | TaskListSidebar |
| UC016: タスク移動 | 🔄 部分実装 | ✅ [`moveTaskAction`](app/actions/task-actions.ts:30) | ❌ 未実装 | TaskDragDropContainer |

### 実装状況サマリー
- ✅ **完全実装**: 4機能（25%）
- 🔄 **部分実装**: 7機能（44%） - Server Action存在、UI未統合
- ❌ **未実装**: 5機能（31%） - Server Action・UI共に未実装

## 14. 実装フェーズ（現実的段階計画）

### Phase 0: 緊急対応（P0 - 最優先）
**目標**: 基本的なユーザー体験確立
1. **メインページ実装**: [`app/page.tsx`](app/page.tsx)をダッシュボードリダイレクトに変更
2. **タスク作成UI**: 既存[`createTaskAction`](app/actions/task-actions.ts:7)との統合
3. **タスクリスト作成UI**: 既存[`createTaskListAction`](app/actions/task-list-actions.ts:6)との統合
4. **基本エラーハンドリング**: ユーザビリティ向上

**期間**: 1-2日
**成果物**: 実際に使えるTODOアプリの基盤

### Phase 1: 基本CRUD操作完成（P1 - 高優先度）
**目標**: 完全なタスク管理機能
1. **タスク編集機能**: Server Action + UI実装
2. **タスク削除機能**: Server Action + UI実装
3. **タスクリスト削除UI**: 既存[`deleteTaskListAction`](app/actions/task-list-actions.ts:18)との統合
4. **タスク移動UI**: 既存[`moveTaskAction`](app/actions/task-actions.ts:30)との統合

**期間**: 2-3日
**成果物**: 完全なCRUD操作対応

### Phase 2: 高度な機能統合（P2 - 中優先度）
**目標**: ユーザビリティ向上
1. **ドラッグ&ドロップ**: Client Component実装
2. **期日ソート機能**: URLパラメータ + UI
3. **タスクリスト名変更**: Server Action + UI実装
4. **詳細なエラーハンドリング**: 包括的エラー対応

**期間**: 3-4日
**成果物**: 高度なインタラクション機能

### Phase 3: 最適化・拡張（P3 - 低優先度）
**目標**: プロダクション品質
1. **パフォーマンス最適化**: レンダリング最適化
2. **レスポンシブ対応**: モバイル・タブレット対応
3. **アクセシビリティ**: WCAG準拠
4. **追加機能**: 検索、タグ、通知等

**期間**: 継続的改善
**成果物**: プロダクション品質のアプリケーション

## 15. 技術的利点

### パフォーマンス
- 初期ページロード高速化
- バンドルサイズ削減
- サーバーサイドレンダリングによるSEO最適化

### 開発体験
- 型安全性の維持
- 直接的なビジネスロジック呼び出し
- シンプルな状態管理

### 保守性
- Server/Client Componentsの明確な分離
- 単一責任原則の適用
- テスタビリティの向上

## 16. 次のステップ（優先度順）

### 即座に対応（今日中）
1. **メインページ実装**: [`app/page.tsx`](app/page.tsx)をダッシュボードリダイレクトに変更
2. **タスク作成UI**: モーダル + 既存[`createTaskAction`](app/actions/task-actions.ts:7)統合

### 短期対応（1週間以内）
3. **タスクリスト作成UI**: サイドバー + 既存[`createTaskListAction`](app/actions/task-list-actions.ts:6)統合
4. **タスク編集・削除**: Server Action + UI実装
5. **エラーハンドリング**: ユーザビリティ向上

### 中期対応（2週間以内）
6. **高度なインタラクション**: ドラッグ&ドロップ、ソート機能
7. **レスポンシブ対応**: モバイル・タブレット最適化

## 17. 重要な方針転換

### 従来の計画（理想的）
- アプリケーションサービス層完了を前提とした包括的UI実装

### 新しい計画（現実的）
- **既存資産最大活用**: 実装済みServer Actionsの優先統合
- **段階的実装**: P0→P1→P2→P3の明確な優先順位
- **ユーザー体験重視**: 実際に使える機能の早期提供
- **品質維持**: バックエンドの高品質アーキテクチャを保持

---

**作成日**: 2025年6月2日
**更新日**: 2025年6月3日（実装状況反映）
**対象**: TODOアプリケーション UI層統合
**現状**: バックエンド95%完了、UI統合30%完了
**緊急課題**: メインページ未実装、CRUD操作UI大部分未統合