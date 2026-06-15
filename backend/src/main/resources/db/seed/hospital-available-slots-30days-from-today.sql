START TRANSACTION;

-- 이미지 기준 병원 6곳의 기존 슬롯을 먼저 비운다.
DELETE slot
FROM hospital_available_slot AS slot
JOIN hospital AS h
  ON h.hospital_id = slot.hospital_id
WHERE h.name IN (
  '서울하나내과',
  '강남튼튼정형외과',
  '미소가득치과',
  '인천바른내과',
  '부산든든정형외과',
  '다정가정의학과'
);

-- 오늘부터 30일 동안 병원 운영시간 기준 30분 단위 슬롯을 다시 채운다.
INSERT INTO hospital_available_slot (
  hospital_id,
  available_at,
  is_available,
  created_at,
  updated_at
)
WITH RECURSIVE day_offsets AS (
  SELECT 0 AS day_offset
  UNION ALL
  SELECT day_offset + 1
  FROM day_offsets
  WHERE day_offset < 29
),
half_hour_offsets AS (
  SELECT 0 AS slot_index
  UNION ALL
  SELECT slot_index + 1
  FROM half_hour_offsets
  WHERE slot_index < 47
),
target_hospitals AS (
  SELECT
    hospital_id,
    name,
    open_time,
    close_time,
    break_time,
    day_off
  FROM hospital
  WHERE name IN (
    '서울하나내과',
    '강남튼튼정형외과',
    '미소가득치과',
    '인천바른내과',
    '부산든든정형외과',
    '다정가정의학과'
  )
)
SELECT
  h.hospital_id,
  TIMESTAMP(
    DATE_ADD(CURDATE(), INTERVAL d.day_offset DAY),
    SEC_TO_TIME(t.slot_index * 1800)
  ) AS available_at,
  TRUE AS is_available,
  NOW() AS created_at,
  NOW() AS updated_at
FROM target_hospitals AS h
JOIN day_offsets AS d
JOIN half_hour_offsets AS t
WHERE
  SEC_TO_TIME(t.slot_index * 1800) >= CAST(CONCAT(h.open_time, ':00') AS TIME)
  AND SEC_TO_TIME(t.slot_index * 1800) < CAST(CONCAT(h.close_time, ':00') AS TIME)
  AND (
    h.break_time IS NULL
    OR h.break_time = ''
    OR SEC_TO_TIME(t.slot_index * 1800) < CAST(CONCAT(SUBSTRING_INDEX(h.break_time, '-', 1), ':00') AS TIME)
    OR SEC_TO_TIME(t.slot_index * 1800) >= CAST(CONCAT(SUBSTRING_INDEX(h.break_time, '-', -1), ':00') AS TIME)
  )
  AND NOT (
    (h.day_off = '월요일' AND DAYOFWEEK(DATE_ADD(CURDATE(), INTERVAL d.day_offset DAY)) = 2)
    OR (h.day_off = '화요일' AND DAYOFWEEK(DATE_ADD(CURDATE(), INTERVAL d.day_offset DAY)) = 3)
    OR (h.day_off = '수요일' AND DAYOFWEEK(DATE_ADD(CURDATE(), INTERVAL d.day_offset DAY)) = 4)
    OR (h.day_off = '목요일' AND DAYOFWEEK(DATE_ADD(CURDATE(), INTERVAL d.day_offset DAY)) = 5)
    OR (h.day_off = '금요일' AND DAYOFWEEK(DATE_ADD(CURDATE(), INTERVAL d.day_offset DAY)) = 6)
    OR (h.day_off = '토요일' AND DAYOFWEEK(DATE_ADD(CURDATE(), INTERVAL d.day_offset DAY)) = 7)
    OR (h.day_off = '일요일' AND DAYOFWEEK(DATE_ADD(CURDATE(), INTERVAL d.day_offset DAY)) = 1)
  )
ORDER BY
  h.hospital_id,
  available_at;

-- 이미 존재하는 예약이 있으면 해당 슬롯은 다시 unavailable 상태로 맞춘다.
UPDATE hospital_available_slot AS slot
JOIN reservation AS r
  ON r.hospital_id = slot.hospital_id
 AND r.reserved_at = slot.available_at
JOIN hospital AS h
  ON h.hospital_id = slot.hospital_id
SET
  slot.is_available = FALSE,
  slot.updated_at = NOW()
WHERE
  r.status = 'RESERVED'
  AND h.name IN (
    '서울하나내과',
    '강남튼튼정형외과',
    '미소가득치과',
    '인천바른내과',
    '부산든든정형외과',
    '다정가정의학과'
  );

COMMIT;
