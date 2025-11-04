import { MyApplicationList } from '@/features/campaign/components/MyApplicationList';

export const metadata = {
  title: '내 지원 목록',
};

export default function MyApplicationsPage() {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          내 지원 목록
        </h1>
        <p className="text-slate-600">
          지원한 체험단의 상태를 확인하고 관리하세요.
        </p>
      </div>

      <MyApplicationList />
    </div>
  );
}
