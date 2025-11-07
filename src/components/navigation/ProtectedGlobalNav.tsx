"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import type { CurrentUser, UserRole } from "@/features/auth/types";

type NavItem = {
  href: string;
  label: string;
  isActive: (pathname: string) => boolean;
};

const influencerNavItems: NavItem[] = [
  {
    href: "/",
    label: "홈",
    isActive: (pathname) => pathname === "/",
  },
  {
    href: "/influencer/dashboard",
    label: "대시보드",
    isActive: (pathname) => pathname.startsWith("/influencer/dashboard"),
  },
  {
    href: "/campaigns",
    label: "체험단 둘러보기",
    isActive: (pathname) => pathname.startsWith("/campaigns"),
  },
  {
    href: "/my-applications",
    label: "내 지원 목록",
    isActive: (pathname) => pathname.startsWith("/my-applications"),
  },
];

const advertiserNavItems: NavItem[] = [
  {
    href: "/",
    label: "홈",
    isActive: (pathname) => pathname === "/",
  },
  {
    href: "/advertiser/campaigns",
    label: "대시보드",
    isActive: (pathname) =>
      pathname.startsWith("/advertiser/campaigns"),
  },
  {
    href: "/campaigns",
    label: "체험단 둘러보기",
    isActive: (pathname) => pathname.startsWith("/campaigns"),
  },
];

const fallbackNavItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "대시보드",
    isActive: (pathname) => pathname.startsWith("/dashboard"),
  },
];

const roleLabelMap: Record<UserRole, string> = {
  advertiser: "광고주",
  influencer: "인플루언서",
};

const roleBadgeClassMap: Record<UserRole, string> = {
  advertiser: "bg-purple-100 text-purple-800",
  influencer: "bg-emerald-100 text-emerald-800",
};

const getUserRole = (user: CurrentUser | null | undefined) => {
  const rawRole =
    (user?.appMetadata as Record<string, unknown>)?.role ??
    (user?.userMetadata as Record<string, unknown>)?.role;

  if (rawRole === "advertiser" || rawRole === "influencer") {
    return rawRole;
  }

  return undefined;
};

export const ProtectedGlobalNav = () => {
  const { user, isLoading, refresh, isAuthenticated } = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();
  const role = useMemo(() => getUserRole(user), [user]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const navItems = useMemo(() => {
    if (role === "advertiser") {
      return advertiserNavItems;
    }

    if (role === "influencer") {
      return influencerNavItems;
    }

    return fallbackNavItems;
  }, [role]);

  const handleSignOut = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    await refresh();
    router.replace("/");
  }, [refresh, router]);

  if (!isMounted) {
    return (
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="h-6 w-32 animate-pulse rounded bg-slate-200" />
          <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex flex-1 items-center gap-3">
          <Link
            href={role === "advertiser" ? "/advertiser/campaigns" : "/dashboard"}
            className="text-lg font-semibold text-slate-900"
          >
            체험단 대시보드
          </Link>
          <nav className="flex flex-wrap items-center gap-1">
            {navItems.map((item) => {
              const active = item.isActive(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition",
                    active
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 text-sm text-slate-600">
          {isLoading ? (
            <span className="text-slate-500">세션 확인 중...</span>
          ) : isAuthenticated && user ? (
            <>
              <span className="font-medium">{user.email}</span>
              {role && (
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    roleBadgeClassMap[role]
                  )}
                >
                  {roleLabelMap[role]}
                </span>
              )}
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                로그아웃
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="outline" size="sm">
                  로그인
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">회원가입</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
