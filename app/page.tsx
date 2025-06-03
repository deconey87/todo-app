import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TODOアプリ - タスク管理',
  description: 'シンプルで効率的なタスク管理アプリケーション。タスクの作成、編集、ステータス管理を簡単に行えます。',
  keywords: ['TODO', 'タスク管理', 'プロジェクト管理', '生産性'],
  openGraph: {
    title: 'TODOアプリ - タスク管理',
    description: 'シンプルで効率的なタスク管理アプリケーション',
    type: 'website',
  },
};

export default function HomePage() {
  // ユーザーが / にアクセスした際に /dashboard にリダイレクト
  redirect('/dashboard');
}
