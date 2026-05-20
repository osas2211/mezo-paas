import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class TransferCreditsDTO {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsNumber({ allowNaN: false, allowInfinity: false })
  @IsNotEmpty()
  amount: number;
}
