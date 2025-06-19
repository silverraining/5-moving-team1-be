import { InternalServerErrorException } from '@nestjs/common';

export async function handleError<T>(
  fn: () => Promise<T>, // Function to execute
  errorMessage: string, // 500 error message to throw on failure
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error(error); // 또는 로깅 서비스 호출
    throw new InternalServerErrorException(errorMessage);
  }
}
