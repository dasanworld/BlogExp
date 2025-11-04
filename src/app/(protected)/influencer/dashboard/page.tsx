"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function InfluencerDashboardPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">인플루언서 대시보드</h1>
        <p className="text-slate-500">참여 가능한 체험을 살펴보고 지원 내역을 확인하세요.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-medium mb-2">체험 둘러보기</h2>
          <p className="text-sm text-slate-600 mb-4">모집 중인 체험을 확인하고 지원하세요.</p>
          <Button asChild>
            <Link href="/">홈으로 가기</Link>
          </Button>
        </div>
        <div className="rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-medium mb-2">내 지원 내역</h2>
          <p className="text-sm text-slate-600 mb-4">지원 상태를 확인할 수 있어요.</p>
          <Button asChild variant="outline">
            <Link href="/my-applications">내 지원 목록</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}



