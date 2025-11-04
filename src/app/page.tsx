'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { CampaignList } from '@/features/campaign/components/CampaignList';
import { useCallback } from 'react';

export default function Home() {
  const { user, isAuthenticated, isLoading, refresh } = useCurrentUser();
  const router = useRouter();

  const handleSignOut = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    await refresh();
    router.replace('/');
  }, [refresh, router]);

  return (
    <main className="min-h-screen bg-white">
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-900">
              블로그 체험단 플랫폼
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {isLoading && (
              <span className="text-sm text-slate-500">세션 확인 중...</span>
            )}

            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600">{user.email}</span>
                {(() => {
                  const role = (user.appMetadata as any)?.role || (user.userMetadata as any)?.role;
                  const label = role === 'advertiser' ? '광고주' : role === 'influencer' ? '인플루언서' : '역할 미지정';
                  const cls = role === 'advertiser' ? 'bg-purple-100 text-purple-800' : role === 'influencer' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800';
                  return (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${cls}`}>{label}</span>
                  );
                })()}
                <div className="flex items-center gap-2">
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm">
                      대시보드
                    </Button>
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex items-center gap-1 rounded-md bg-slate-900 px-3 py-2 text-sm text-white transition hover:bg-slate-800"
                  >
                    <LogOut className="h-4 w-4" />
                    로그아웃
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    로그인
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">
                    회원가입
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            모집 중인 체험단
          </h2>
          <p className="mt-2 text-slate-600">
            아래에서 관심 있는 체험단을 찾아보세요
          </p>
        </div>

        <CampaignList />
      </div>
    </main>
  );
}
