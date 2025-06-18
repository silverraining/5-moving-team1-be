export enum ServiceType {
  SMALL = 'SMALL',
  HOME = 'HOME',
  OFFICE = 'OFFICE',
}

export enum ServiceRegion {
  SEOUL = 'Seoul',
  GYEONGGI = 'Gyeonggi-do',
  INCHEON = 'Incheon',
  GANGWON = 'Gangwon-do',
  CHUNGBUK = 'Chungcheongbuk-do',
  CHUNGNAM = 'Chungcheongnam-do',
  SEJONG = 'Sejong-si',
  DAEJEON = 'Daejeon',
  JEONBUK = 'Jeonbuk-do',
  JEONNAM = 'Jeollanam-do',
  GWANGJU = 'Gwangju',
  GYEONGBUK = 'Gyeongsangbuk-do',
  GYEONGNAM = 'Gyeongsangnam-do',
  DAEGU = 'Daegu',
  ULSAN = 'Ulsan',
  BUSAN = 'Busan',
  JEJU = 'Jeju-do',
}

export type ServiceTypeMap = Record<ServiceType, boolean>;
export type ServiceRegionMap = Record<ServiceRegion, boolean>;
type ServiceEnum = Record<string, string>;

const createAllTrueMap = <T extends ServiceEnum>(enumObject: T) => {
  const allValues = Object.values(enumObject);

  const allTrueMap = Object.fromEntries(
    allValues.map((value) => [value, true]),
  );

  return allTrueMap as Record<T[keyof T], boolean>;
};

// create-service.dto의 기본값
export const defaultServiceType: ServiceTypeMap = createAllTrueMap(ServiceType);
export const defaultServiceRegion: ServiceRegionMap =
  createAllTrueMap(ServiceRegion);

// get-service.dto의 기본값
// get요청에서 query 파라미터의 기본값
export const commaDefaultServiceType: string =
  Object.values(ServiceType).join(',');
export const commaDefaultServiceRegion: string =
  Object.values(ServiceRegion).join(',');
