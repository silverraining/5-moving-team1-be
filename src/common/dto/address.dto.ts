export class AddressDto {
  sido: string;

  sidoEnglish: string;

  sigungu: string;

  roadAddress: string;

  fullAddress: string;

  static from(address: any): AddressDto {
    const dto = new AddressDto();
    dto.sido = address.sido;
    dto.sidoEnglish = address.sidoEnglish;
    dto.sigungu = address.sigungu;
    dto.roadAddress = address.roadAddress;
    dto.fullAddress = address.fullAddress;
    return dto;
  }
}
