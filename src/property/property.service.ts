import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PropertyRepository } from './property.repository';
import { CreatePropertyDto } from './dto/create-property.dto';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(PropertyRepository)
    private readonly propertyRepo: PropertyRepository,
  ) {}

  async create(createPropertyDto: CreatePropertyDto) {
    return this.propertyRepo.createProperty(createPropertyDto);
  }

  async remove(id: string) {
    return this.propertyRepo.deleteProperty(id);
  }

  async findWithinPolygon(
    polygon: number[][],
    filters: {
      minPrice?: number;
      maxPrice?: number;
      bedrooms?: number;
      bathrooms?: number;
    },
  ) {
    return this.propertyRepo.findWithinPolygon(polygon, filters);
  }

  async findOne(id: string) {
    return this.propertyRepo.findOne({ where: { id } });
  }
}
