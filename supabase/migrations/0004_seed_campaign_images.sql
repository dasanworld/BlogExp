-- 캠페인 테이블에 대표 이미지 링크 추가 (샘플 10개)
-- 이미 존재하는 캠페인에만 이미지를 추가합니다 ("ImgLink"가 null인 경우)

-- 카페 체험 캠페인 이미지
UPDATE public.campaigns
SET "ImgLink" = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&q=80'
WHERE id = (SELECT id FROM public.campaigns WHERE title ILIKE '%cafe%' OR title ILIKE '%coffee%' LIMIT 1)
  AND "ImgLink" IS NULL;

-- 뷰티/코스메틱 캠페인 이미지
UPDATE public.campaigns
SET "ImgLink" = 'https://images.unsplash.com/photo-1596462502278-af242a95b598?w=800&q=80'
WHERE id = (SELECT id FROM public.campaigns WHERE title ILIKE '%beauty%' OR title ILIKE '%cosmetic%' LIMIT 1)
  AND "ImgLink" IS NULL;

-- 패션/의류 캠페인 이미지
UPDATE public.campaigns
SET "ImgLink" = 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80'
WHERE id = (SELECT id FROM public.campaigns WHERE title ILIKE '%fashion%' OR title ILIKE '%clothing%' LIMIT 1)
  AND "ImgLink" IS NULL;

-- 음식/맛집 캠페인 이미지
UPDATE public.campaigns
SET "ImgLink" = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80'
WHERE id = (SELECT id FROM public.campaigns WHERE title ILIKE '%food%' OR title ILIKE '%restaurant%' LIMIT 1)
  AND "ImgLink" IS NULL;

-- 전자기기/기술 캠페인 이미지
UPDATE public.campaigns
SET "ImgLink" = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'
WHERE id = (SELECT id FROM public.campaigns WHERE title ILIKE '%tech%' OR title ILIKE '%device%' LIMIT 1)
  AND "ImgLink" IS NULL;

-- 운동/피트니스 캠페인 이미지
UPDATE public.campaigns
SET "ImgLink" = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80'
WHERE id = (SELECT id FROM public.campaigns WHERE title ILIKE '%fitness%' OR title ILIKE '%sport%' LIMIT 1)
  AND "ImgLink" IS NULL;

-- 여행/관광 캠페인 이미지
UPDATE public.campaigns
SET "ImgLink" = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80'
WHERE id = (SELECT id FROM public.campaigns WHERE title ILIKE '%travel%' OR title ILIKE '%tour%' LIMIT 1)
  AND "ImgLink" IS NULL;

-- 도서/출판 캠페인 이미지
UPDATE public.campaigns
SET "ImgLink" = 'https://images.unsplash.com/photo-1507842217343-583f20270319?w=800&q=80'
WHERE id = (SELECT id FROM public.campaigns WHERE title ILIKE '%book%' OR title ILIKE '%read%' LIMIT 1)
  AND "ImgLink" IS NULL;

-- 홈/인테리어 캠페인 이미지
UPDATE public.campaigns
SET "ImgLink" = 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80'
WHERE id = (SELECT id FROM public.campaigns WHERE title ILIKE '%home%' OR title ILIKE '%interior%' LIMIT 1)
  AND "ImgLink" IS NULL;

-- 자동차/모빌리티 캠페인 이미지
UPDATE public.campaigns
SET "ImgLink" = 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=800&q=80'
WHERE id = (SELECT id FROM public.campaigns WHERE title ILIKE '%car%' OR title ILIKE '%auto%' LIMIT 1)
  AND "ImgLink" IS NULL;

-- 분류별 기본 이미지 설정 (나머지 null 값들)
-- 첫 번째~다섯 번째 미분류 캠페인
UPDATE public.campaigns
SET "ImgLink" = 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=800&q=80'
WHERE "ImgLink" IS NULL AND id IN (
  SELECT id FROM public.campaigns WHERE "ImgLink" IS NULL LIMIT 5
);

-- 여섯 번째~열 번째 미분류 캠페인
UPDATE public.campaigns
SET "ImgLink" = 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80'
WHERE "ImgLink" IS NULL AND id IN (
  SELECT id FROM public.campaigns WHERE "ImgLink" IS NULL LIMIT 5
);

-- 추가 샘플 이미지 1: 스포츠/액티비티
UPDATE public.campaigns
SET "ImgLink" = 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80'
WHERE "ImgLink" IS NULL AND id IN (
  SELECT id FROM public.campaigns WHERE "ImgLink" IS NULL LIMIT 1
);

-- 추가 샘플 이미지 2: 뮤직/공연
UPDATE public.campaigns
SET "ImgLink" = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80'
WHERE "ImgLink" IS NULL AND id IN (
  SELECT id FROM public.campaigns WHERE "ImgLink" IS NULL LIMIT 1
);

-- 추가 샘플 이미지 3: 라이프스타일/웰니스
UPDATE public.campaigns
SET "ImgLink" = 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80'
WHERE "ImgLink" IS NULL AND id IN (
  SELECT id FROM public.campaigns WHERE "ImgLink" IS NULL LIMIT 1
);

