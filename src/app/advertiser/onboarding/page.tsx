import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AdvertiserProfileForm } from '@/features/advertiser/components/ProfileForm';

export default function AdvertiserOnboardingPage() {
  return (
    <div className="container max-w-2xl mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle>광고주 정보 등록</CardTitle>
          <CardDescription>사업자 정보와 업체 정보를 등록해 주세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <AdvertiserProfileForm />
          </CardContent>
        </Card>
    </div>
  );
}

 
