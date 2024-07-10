import { Controller, Get, Post, Body, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { RegistryService } from './registry.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';
import { ItemDto } from './dto/item.dto';
import { ItemsDto } from './dto/items.dto';

@ApiTags('registry')
@Controller('registry')
@UsePipes(new ValidationPipe({ transform: true }))
export class RegistryController {
  constructor(private readonly registryService: RegistryService) {}

  @Get('check')
  @ApiOperation({ summary: 'Check if an item is in the registry' })
  @ApiQuery({ name: 'item', required: true, description: 'The item to check' })
  @ApiResponse({ status: 200, description: 'Item status in the registry', type: String })
  async check(@Query('item') item: string): Promise<string> {
    return this.registryService.check(item);
  }

  @Post('add')
  @ApiOperation({ summary: 'Add an item to the registry' })
  @ApiBody({ type: ItemDto })
  @ApiResponse({ status: 201, description: 'Item added to the registry', type: String })
  async add(@Body() body: ItemDto): Promise<string> {
    return this.registryService.add(body.item);
  }

  @Post('remove')
  @ApiOperation({ summary: 'Remove an item from the registry' })
  @ApiBody({ type: ItemDto })
  @ApiResponse({ status: 201, description: 'Item removed from the registry', type: String })
  async remove(@Body() body: ItemDto): Promise<string> {
    return this.registryService.remove(body.item);
  }

  @Post('diff')
  @ApiOperation({ summary: 'Compare a submitted set to the current set' })
  @ApiBody({ type: ItemsDto })
  @ApiResponse({ status: 201, description: 'Difference between sets', type: [String] })
  async diff(@Body() body: ItemsDto): Promise<string[]> {
    return this.registryService.diff(body.items);
  }

  @Post('invert')
  @ApiOperation({ summary: 'Invert the current set' })
  @ApiResponse({ status: 201, description: 'Set inverted', type: String })
  async invert(): Promise<string> {
    return this.registryService.invert();
  }
}
