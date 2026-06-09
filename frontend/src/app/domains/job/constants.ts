import type { JobRegion } from './types'

export const jobRegionLabels: Record<JobRegion, string> = {
  ALL: '전국',
  SEOUL: '서울',
  BUSAN: '부산',
  DAEGU: '대구',
  INCHEON: '인천',
  GWANGJU: '광주',
  DAEJEON: '대전',
  ULSAN: '울산',
  GYEONGGI: '경기',
}

export const jobRegions: JobRegion[] = [
  'ALL',
  'SEOUL',
  'BUSAN',
  'DAEGU',
  'INCHEON',
  'GWANGJU',
  'DAEJEON',
  'ULSAN',
  'GYEONGGI',
]
