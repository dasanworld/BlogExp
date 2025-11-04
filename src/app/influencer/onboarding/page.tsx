import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ProfileForm } from '@/features/influencer/components/ProfileForm';

export default function InfluencerOnboardingPage() {
  return (
    <div className="container max-w-2xl mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>인플루언서 정보 등록</CardTitle>
          <CardDescription>생년월일과 SNS 채널을 등록해 주세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm />
        </CardContent>
      </Card>
    </div>
  );
}

 
