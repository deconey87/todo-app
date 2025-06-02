import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function DashboardHeader() {
  return (
    <Card className="m-6 mb-4">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">タスク管理ダッシュボード</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          タスクを効率的に管理し、プロジェクトを成功に導きましょう。
        </p>
      </CardContent>
    </Card>
  );
}