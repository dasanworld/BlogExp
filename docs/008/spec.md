# UC-008: 광고주 체험단 관리

## Primary Actor
- 광고주 (검증 완료)

## Precondition
- 로그인된 상태
- 역할이 '광고주'
- 광고주 검증 완료 (`verification_status = 'verified'`)

## Trigger
- 광고주가 "체험단 관리" 메뉴 클릭
- 대시보드에서 체험단 관리 섹션 접근

## Main Scenario

### 1. 체험단 관리 페이지 접근
1. 사용자가 "체험단 관리" 메뉴를 클릭한다
2. 시스템이 체험단 관리 페이지를 표시한다:
   - "신규 체험단 등록" 버튼 (상단 또는 고정 위치)
   - 내가 등록한 체험단 목록
   - 상태별 필터 탭

### 2. 체험단 목록 조회
1. 시스템이 광고주가 등록한 모든 체험단을 조회한다
2. 시스템이 상태별 탭을 표시한다:
   - 전체
   - 모집 중 (recruiting)
   - 모집 종료 (closed)
   - 선정 완료 (selection_completed)
3. 각 체험단 카드에 다음 정보를 표시한다:
   - 체험단 제목
   - 등록일
   - 모집 기간 (D-day 표시)
   - 모집 상태 배지
   - 지원자 수 / 모집 인원
   - 액션 버튼: "상세/관리", "수정", "삭제"

### 3. 신규 체험단 등록
1. 사용자가 "신규 체험단 등록" 버튼을 클릭한다
2. 시스템이 등록 폼을 표시한다 (Dialog 또는 새 페이지):
   - **기본 정보**
     - 체험단 제목 (필수)
     - 상세 설명 (필수)
     - 제공 혜택 (필수)
     - 미션 내용 (필수)
   - **장소**
     - 위치 (주소 검색 또는 직접 입력) (필수)
   - **모집 기간**
     - 모집 시작일 (필수)
     - 모집 종료일 (필수)
   - **체험 기간**
     - 체험 시작일 (필수)
     - 체험 종료일 (필수)
   - **모집 인원**
     - 총 모집 인원 (필수, 양수)
   - **이미지** (선택사항)

### 4. 등록 폼 작성
1. 사용자가 체험단 정보를 입력한다
2. 시스템이 실시간으로 유효성을 검증한다:
   - 제목: 5-255자
   - 설명, 혜택, 미션: 10자 이상
   - 모집 종료일 >= 모집 시작일
   - 체험 종료일 >= 체험 시작일
   - 체험 시작일 >= 모집 종료일 (권장)
   - 모집 인원: 1명 이상

### 5. 체험단 등록 제출
1. 사용자가 "등록" 버튼을 클릭한다
2. 시스템이 최종 유효성을 검사한다
3. 시스템이 체험단을 생성한다:
   - `campaigns` INSERT
   - `status = 'recruiting'`
   - `selected_count = 0`
4. 시스템이 성공 메시지를 표시한다
5. 시스템이 등록된 체험단을 목록에 추가한다

### 6. 체험단 수정
1. 사용자가 체험단의 "수정" 버튼을 클릭한다
2. 시스템이 수정 폼을 표시한다 (기존 데이터 로드)
3. 사용자가 정보를 수정한다
4. 사용자가 "저장" 버튼을 클릭한다
5. 시스템이 변경사항을 저장한다

### 7. 체험단 삭제
1. 사용자가 체험단의 "삭제" 버튼을 클릭한다
2. 시스템이 확인 다이얼로그를 표시한다:
   - "정말 삭제하시겠습니까?"
   - "지원자 정보도 함께 삭제됩니다" 경고
3. 사용자가 "확인" 버튼을 클릭한다
4. 시스템이 체험단을 삭제한다 (CASCADE)
5. 시스템이 목록을 갱신한다

### 8. 체험단 상세/관리
1. 사용자가 체험단 카드를 클릭하거나 "상세/관리" 버튼을 클릭한다
2. 시스템이 체험단 상세 관리 페이지로 이동한다 (UC-009)

## Edge Cases

### 등록된 체험단 없음
- **발생 조건**: 아직 등록한 체험단이 없음
- **처리**: "등록된 체험단이 없습니다" 메시지, "신규 등록" 버튼 강조

### 검증 미완료 상태
- **발생 조건**: `verification_status != 'verified'`
- **처리**: "프로필 검증이 필요합니다" 메시지, 등록 버튼 비활성화

### 필수 필드 누락
- **발생 조건**: 필수 필드를 입력하지 않고 제출
- **처리**: 해당 필드에 오류 메시지 표시, 제출 불가

### 날짜 유효성 오류
- **발생 조건**: 종료일이 시작일보다 이른 경우
- **처리**: "종료일은 시작일 이후여야 합니다" 오류 메시지

### 모집 인원 0 이하
- **발생 조건**: 모집 인원을 0 또는 음수로 입력
- **처리**: "모집 인원은 1명 이상이어야 합니다" 오류 메시지

### 지원자가 있는 체험단 삭제
- **발생 조건**: 지원자가 있는 체험단 삭제 시도
- **처리**: "지원자가 있는 체험단입니다. 정말 삭제하시겠습니까?" 강한 경고

### 모집 중인 체험단 수정 제한
- **발생 조건**: 모집 중이고 지원자가 있는 상태에서 모집 인원 감소 시도
- **처리**: "현재 지원자보다 적은 인원으로 변경할 수 없습니다" 오류

### 선정 완료 후 삭제 제한
- **발생 조건**: 선정 완료된 체험단 삭제 시도
- **처리**: "선정이 완료된 체험단은 삭제할 수 없습니다" 오류 (또는 Soft Delete)

### 네트워크 오류
- **발생 조건**: 등록/수정/삭제 중 오류 발생
- **처리**: "일시적인 오류가 발생했습니다" 메시지, 재시도 옵션

### 이미지 업로드 실패
- **발생 조건**: 이미지 업로드 중 오류
- **처리**: "이미지 업로드에 실패했습니다" 메시지, 이미지 없이 등록 가능

## Business Rules

### BR-071: 등록 권한
- 검증 완료된 광고주만 체험단 등록 가능
- `verification_status = 'verified'`

### BR-072: 체험단 제목
- 5자 이상, 255자 이하
- 특수문자 허용

### BR-073: 상세 설명/혜택/미션
- 각 10자 이상
- HTML 또는 마크다운 지원 (선택사항)
- XSS 방지 필터링

### BR-074: 날짜 제약
- 모집 종료일 >= 모집 시작일
- 체험 종료일 >= 체험 시작일
- 체험 시작일 >= 모집 종료일 (권장, 필수 아님)

### BR-075: 모집 인원
- 1명 이상 (양수)
- 최대 인원 제한 없음 (또는 정책에 따라 설정)

### BR-076: 초기 상태
- 등록 시 `status = 'recruiting'`
- `selected_count = 0`

### BR-077: 수정 제한
- 본인이 등록한 체험단만 수정 가능
- 모집 인원은 현재 지원자 수 이상으로만 변경 가능

### BR-078: 삭제 제한
- 본인이 등록한 체험단만 삭제 가능
- 선정 완료 후 삭제 불가 (또는 Soft Delete)
- CASCADE 삭제: 지원서도 함께 삭제

### BR-079: 페이지네이션
- 한 페이지당 10개 또는 20개 표시
- 최신 등록순 기본 정렬

### BR-080: 상태별 필터
- 전체, 모집 중, 모집 종료, 선정 완료 탭
- 각 탭에 개수 표시

---

## Sequence Diagram

```plantuml
@startuml
actor User
participant FE as "Frontend"
participant BE as "Backend API"
database DB as "Database"

User -> FE: "체험단 관리" 메뉴 클릭
FE -> User: 로딩 상태 표시

FE -> BE: GET /api/advertiser/campaigns
BE -> DB: SELECT verification_status\nFROM advertiser_profiles\nWHERE user_id = :user_id
DB -> BE: 검증 상태 반환

alt 검증 미완료
    BE -> FE: 403 Forbidden {error: "검증 필요"}
    FE -> User: "프로필 검증이 필요합니다" 메시지
else 검증 완료
    BE -> DB: SELECT c.*, COUNT(ca.id) as applicant_count\nFROM campaigns c\nLEFT JOIN campaign_applications ca ON c.id = ca.campaign_id\nWHERE c.advertiser_id = :user_id\nGROUP BY c.id\nORDER BY c.created_at DESC
    DB -> BE: 체험단 목록 반환
    
    alt 등록된 체험단 없음
        BE -> FE: 200 OK {campaigns: [], counts: {...}}
        FE -> User: "등록된 체험단이 없습니다"\n"신규 등록" 버튼 강조
    else 체험단 있음
        BE -> FE: 200 OK {campaigns: [...], counts: {...}}
        FE -> User: 체험단 목록 표시\n상태별 탭 (카운트 포함)
    end
end

== 신규 체험단 등록 ==

User -> FE: "신규 체험단 등록" 버튼 클릭
FE -> User: 등록 폼 Dialog 표시

User -> FE: 체험단 정보 입력\n(제목, 설명, 혜택, 미션, 위치, 날짜, 인원)
FE -> FE: 실시간 유효성 검사

User -> FE: "등록" 버튼 클릭
FE -> FE: 최종 유효성 검사

alt 유효성 검사 실패
    FE -> User: 오류 메시지 표시
else 유효성 검사 통과
    FE -> BE: POST /api/advertiser/campaigns\n{title, description, benefits, mission, location, dates, total_slots}
    
    BE -> BE: 입력 데이터 검증
    BE -> BE: 날짜 제약 확인
    
    BE -> DB: INSERT INTO campaigns\n(advertiser_id, title, description, benefits, mission,\nlocation, recruitment_start_date, recruitment_end_date,\nexperience_start_date, experience_end_date,\ntotal_slots, selected_count=0, status='recruiting')
    DB -> BE: 생성 완료 {campaign_id}
    
    BE -> FE: 201 Created {campaign: {...}}
    FE -> User: "체험단이 등록되었습니다" 성공 메시지
    FE -> User: Dialog 닫기, 목록 새로고침
end

== 체험단 수정 ==

User -> FE: "수정" 버튼 클릭
FE -> BE: GET /api/advertiser/campaigns/:campaign_id
BE -> DB: SELECT * FROM campaigns\nWHERE id = :campaign_id\nAND advertiser_id = :user_id
DB -> BE: 체험단 정보 반환

BE -> FE: 200 OK {campaign: {...}}
FE -> User: 수정 폼 표시 (기존 데이터 로드)

User -> FE: 정보 수정
User -> FE: "저장" 버튼 클릭

FE -> BE: PUT /api/advertiser/campaigns/:campaign_id\n{updated fields}

BE -> DB: SELECT COUNT(*) FROM campaign_applications\nWHERE campaign_id = :campaign_id
DB -> BE: 지원자 수 반환

alt 모집 인원을 지원자 수보다 적게 변경 시도
    BE -> FE: 400 Bad Request\n{error: "지원자보다 적은 인원으로 변경 불가"}
    FE -> User: 오류 메시지 표시
else 변경 가능
    BE -> DB: UPDATE campaigns\nSET [fields], updated_at = NOW()\nWHERE id = :campaign_id
    DB -> BE: 업데이트 완료
    
    BE -> FE: 200 OK {campaign: {...}}
    FE -> User: "수정되었습니다" 메시지
    FE -> User: 목록 새로고침
end

== 체험단 삭제 ==

User -> FE: "삭제" 버튼 클릭
FE -> BE: GET /api/advertiser/campaigns/:campaign_id/applicant-count
BE -> DB: SELECT COUNT(*) FROM campaign_applications\nWHERE campaign_id = :campaign_id
DB -> BE: 지원자 수 반환

alt 지원자 있음
    FE -> User: "지원자가 N명 있습니다.\n정말 삭제하시겠습니까?" 강한 경고
else 지원자 없음
    FE -> User: "정말 삭제하시겠습니까?" 확인
end

User -> FE: "확인" 클릭

FE -> BE: DELETE /api/advertiser/campaigns/:campaign_id
BE -> DB: SELECT status FROM campaigns\nWHERE id = :campaign_id\nAND advertiser_id = :user_id
DB -> BE: 상태 반환

alt 선정 완료 상태
    BE -> FE: 400 Bad Request\n{error: "선정 완료된 체험단은 삭제 불가"}
    FE -> User: 오류 메시지 표시
else 삭제 가능
    BE -> DB: DELETE FROM campaigns\nWHERE id = :campaign_id
    Note right of DB: CASCADE로 campaign_applications도 삭제
    DB -> BE: 삭제 완료
    
    BE -> FE: 200 OK {message: "삭제 완료"}
    FE -> User: "체험단이 삭제되었습니다" 메시지
    FE -> User: 목록 새로고침
end

User -> FE: 체험단 카드 클릭
FE -> User: 체험단 상세 관리 페이지로 이동 (UC-009)

@enduml
```

---

## Notes

### 구현 우선순위
1. **High**: 목록 조회 및 기본 CRUD
2. **High**: 신규 체험단 등록
3. **Medium**: 수정 및 삭제
4. **Medium**: 상태별 필터
5. **Low**: 이미지 업로드
6. **Low**: 임시저장

### 기술적 고려사항
- 권한 확인 (RLS 또는 애플리케이션 레벨)
- 날짜 유효성 검사
- 지원자 수 집계 쿼리 최적화
- 이미지 업로드 (S3, Supabase Storage)
- CASCADE 삭제 주의
- 트랜잭션 처리

### UI/UX 고려사항
- 등록 폼 Dialog 또는 전체 페이지
- 필수 필드 표시 (*)
- 날짜 선택기 (Date Range Picker)
- 주소 검색 자동완성
- 마크다운 에디터 (선택사항)
- 이미지 드래그 앤 드롭
- 삭제 확인 경고 강조
- 상태별 배지 색상
- 반응형 디자인

