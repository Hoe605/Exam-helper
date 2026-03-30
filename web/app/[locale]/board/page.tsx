import { Button } from "@/components/ui/button";
import { Link } from '@/i18n/routing';

export default function BoardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-zinc-50 dark:bg-black">
      <h1 className="text-4xl font-bold mb-4">产品后台 (Board)</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-8 text-center max-w-md">
        这是产品的后台管理界面。目前正在建设中...
      </p>
      <Button asChild>
        <Link href="/">返回首页</Link>
      </Button>
    </div>
  );
}
