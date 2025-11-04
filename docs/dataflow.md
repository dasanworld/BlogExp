# 블로그 체험단 SaaS — 데이터플로우

## 1. 회원가입 & 역할 선택 플로우

```
사용자 입력 (이름, 휴대폰번호, 이메일, 약관동의, 역할)
  ↓
auth.users (Supabase Auth 계정 생성)
  ↓
users (프로필 기본 정보: user_id, name, phone, email, role)
  ↓
user_consents (약관 동의 이력: user_id, consent_type, agreed_at)
  ↓
[역할 분기]
  ├─ role = 'influencer' → influencer_profiles 레코드 생성
  └─ role = 'advertiser' → advertiser_profiles 레코드 생성
```

## 2. 인플루언서 정보 등록 플로우

```
인플루언서 입력 (생년월일, SNS 채널 정보)
  ↓
influencer_profiles UPDATE (birth_date, verification_status)
  ↓
influencer_channels INSERT (channel_type, channel_name, channel_url, status)
  ↓
비동기 검증 잡 큐 (채널 패턴 매칭, 메트릭 수집)
  ↓
influencer_channels UPDATE (status: pending → verified / failed)
```

## 3. 광고주 정보 등록 플로우

```
광고주 입력 (업체명, 위치, 카테고리, 사업자등록번호)
  ↓
advertiser_profiles UPDATE (
  business_name, location, category, 
  business_registration_number, verification_status
)
  ↓
비동기 검증 잡 큐 (사업자번호 검증)
  ↓
advertiser_profiles UPDATE (verification_status: pending → verified / failed)
```

## 4. 홈 & 체험단 목록 탐색 플로우

```
사용자 홈 접속 + 필터/정렬 선택
  ↓
campaigns SELECT (
  WHERE status = 'recruiting'
  AND recruitment_end_date >= NOW()
  ORDER BY created_at DESC
  LIMIT/OFFSET for pagination
)
  ↓
체험단 목록 렌더링 (카드 형태)
```

## 5. 체험단 상세 조회 플로우

```
체험단 카드 클릭
  ↓
campaigns SELECT (
  JOIN advertiser_profiles (매장 정보)
  WHERE campaign_id = ?
)
  ↓
권한 체크 (
  IF user.role = 'influencer'
    → influencer_profiles.verification_status = 'verified' 확인
)
  ↓
체험단 상세 정보 렌더링 (기간, 혜택, 미션, 모집인원)
```

## 6. 체험단 지원 플로우

```
인플루언서 지원서 제출 (각오, 방문 예정일자)
  ↓
유효성 검사 (
  - 중복 지원 방지: campaign_applications SELECT WHERE user_id + campaign_id
  - 모집기간 검증: campaigns.recruitment_end_date >= NOW()
  - 인플루언서 검증 완료: influencer_profiles.verification_status = 'verified'
)
  ↓
campaign_applications INSERT (
  campaign_id, user_id, application_message, 
  visit_date, status='pending', applied_at=NOW()
)
  ↓
제출 성공 피드백
```

## 7. 내 지원 목록 조회 플로우 (인플루언서)

```
인플루언서 "내 지원 목록" 접근 + 상태 필터 선택
  ↓
campaign_applications SELECT (
  JOIN campaigns (체험단 정보)
  WHERE user_id = current_user.id
  AND status IN (filter_statuses)  -- pending/selected/rejected
  ORDER BY applied_at DESC
)
  ↓
지원 목록 렌더링 (신청완료/선정/반려)
```

## 8. 광고주 체험단 등록 플로우

```
광고주 "체험단 등록" 버튼 클릭 + 정보 입력
  ↓
권한 검증 (
  user.role = 'advertiser'
  AND advertiser_profiles.verification_status = 'verified'
)
  ↓
campaigns INSERT (
  advertiser_id, title, description, 
  benefits, mission, location,
  recruitment_start_date, recruitment_end_date,
  experience_start_date, experience_end_date,
  total_slots, status='recruiting'
)
  ↓
내 체험단 목록 갱신
```

## 9. 광고주 체험단 관리 & 선정 플로우

```
광고주 체험단 상세 접근
  ↓
[지원자 목록 조회]
campaign_applications SELECT (
  JOIN users, influencer_profiles, influencer_channels
  WHERE campaign_id = ?
  ORDER BY applied_at
)
  ↓
[모집 종료]
광고주 "모집종료" 버튼 클릭
  → campaigns UPDATE (status = 'recruiting' → 'closed')
  ↓
[체험단 선정]
광고주 "선정" 버튼 클릭 + 인원 선택
  ↓
campaign_applications UPDATE (
  status = 'selected' WHERE application_id IN (selected_ids)
  status = 'rejected' WHERE application_id NOT IN (selected_ids)
)
  ↓
campaigns UPDATE (
  status = 'selection_completed',
  selected_count = COUNT(selected_ids)
)
  ↓
선정 완료 피드백 (광고주 & 인플루언서 알림)
```

## 핵심 데이터 흐름 요약

```
┌─────────────────────────────────────────────────────────────┐
│                     회원가입 & 인증                          │
│  auth.users → users → user_consents                         │
│      ├─ influencer_profiles → influencer_channels           │
│      └─ advertiser_profiles                                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      체험단 생성                             │
│  advertiser_profiles → campaigns                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    체험단 지원 & 관리                         │
│  campaigns ← campaign_applications → influencer_profiles    │
│      ↓                     ↓                                 │
│  상태 변경              선정/반려 처리                        │
└─────────────────────────────────────────────────────────────┘
```

