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

export const defaultServiceType: ServiceType[] = Object.values(ServiceType);
export const defaultServiceRegion: ServiceRegion[] =
  Object.values(ServiceRegion);
