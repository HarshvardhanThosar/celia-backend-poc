import { IsInt, Min } from 'class-validator';

export class PurchaseItemDTO {
  @IsInt()
  @Min(1, { message: 'Quantity must be greater than zero' })
  quantity: number;
}
