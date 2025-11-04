"use client";

import { useAutoUpdate } from '@/hooks/useAutoUpdate';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Download, RefreshCw, X } from 'lucide-react';
import { useState } from 'react';

export function UpdateNotification() {
  const { updateAvailable, isUpdating, applyUpdate } = useAutoUpdate();
  const [dismissed, setDismissed] = useState(false);

  if (!updateAvailable || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="border-blue-200 bg-blue-50 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg text-blue-900">업데이트 가능</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDismissed(true)}
              className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-blue-700">
            새로운 버전이 준비되었습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Button
              onClick={applyUpdate}
              disabled={isUpdating}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  업데이트 중...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  지금 업데이트
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setDismissed(true)}
              className="border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              나중에
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}