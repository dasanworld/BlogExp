'use client';

import { Input } from '@/components/ui/input';

interface AddressSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const AddressSearch = ({ value, onChange }: AddressSearchProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-2">
      <Input
        type="text"
        placeholder="예: 서울시 강남구 테헤란로 123"
        value={value}
        onChange={handleChange}
        autoComplete="street-address"
      />
      <p className="text-xs text-gray-500">
        상세 주소까지 입력해주세요
      </p>
    </div>
  );
};
