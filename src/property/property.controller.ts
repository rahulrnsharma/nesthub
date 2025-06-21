import { Controller, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';

@Controller('properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post()
  create(@Body() createPropertyDto: CreatePropertyDto) {
    return this.propertyService.create(createPropertyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.propertyService.remove(id);
  }

  @Post('search')
  async findWithinPolygon(
    @Body() body: {
      polygon: number[][];
      filters?: {
        minPrice?: number;
        maxPrice?: number;
        bedrooms?: number;
        bathrooms?: number;
      };
    },
  ) {
    return this.propertyService.findWithinPolygon(body.polygon, body.filters);
  }
}
