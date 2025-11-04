'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ConsentCheckboxesProps {
  value: {
    termsOfService: true;
    privacyPolicy: true;
    marketing?: boolean;
  };
  onChange: (value: {
    termsOfService: true;
    privacyPolicy: true;
    marketing?: boolean;
  }) => void;
}

export const ConsentCheckboxes = ({ value, onChange }: ConsentCheckboxesProps) => {
  const handleChange = (key: 'termsOfService' | 'privacyPolicy' | 'marketing') => (checked: boolean) => {
    onChange({ ...value, [key]: checked });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start space-x-2">
        <Checkbox
          id="termsOfService"
          checked={value.termsOfService}
          onCheckedChange={handleChange('termsOfService')}
        />
        <Label htmlFor="termsOfService" className="cursor-pointer">
          <span className="text-red-600">*</span> 서비스 이용약관에 동의합니다{' '}
          <a href="/terms" className="text-primary underline" target="_blank" rel="noopener noreferrer">
            (보기)
          </a>
        </Label>
      </div>

      <div className="flex items-start space-x-2">
        <Checkbox
          id="privacyPolicy"
          checked={value.privacyPolicy}
          onCheckedChange={handleChange('privacyPolicy')}
        />
        <Label htmlFor="privacyPolicy" className="cursor-pointer">
          <span className="text-red-600">*</span> 개인정보 처리방침에 동의합니다{' '}
          <a href="/privacy" className="text-primary underline" target="_blank" rel="noopener noreferrer">
            (보기)
          </a>
        </Label>
      </div>

      <div className="flex items-start space-x-2">
        <Checkbox
          id="marketing"
          checked={value.marketing}
          onCheckedChange={handleChange('marketing')}
        />
        <Label htmlFor="marketing" className="cursor-pointer">
          마케팅 정보 수신에 동의합니다 (선택)
        </Label>
      </div>
    </div>
  );
};
