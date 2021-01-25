import { Controller, Put } from '@nestjs/common';

@Controller('api/item')
export class ItemController {
  @Put()
  updateItem() {
    return {};
  }
}
