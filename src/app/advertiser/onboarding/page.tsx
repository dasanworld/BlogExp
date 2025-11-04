import { AdvertiserProfileForm } from '@/features/advertiser/components/ProfileForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdvertiserOnboardingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>광고주 정보 등록</CardTitle>
            <CardDescription>
              업체 정보를 등록하여 체험단 모집을 시작하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdvertiserProfileForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
