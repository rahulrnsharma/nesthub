import { DataSource, Repository } from 'typeorm';
import { Property } from './entities/property.entity';
import { Injectable } from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';

@Injectable()
export class PropertyRepository extends Repository<Property> {
  constructor(private dataSource: DataSource) {
    super(Property, dataSource.createEntityManager());
  }

  async createProperty(data: CreatePropertyDto): Promise<Property> {
    const { title, description, price, bedrooms, bathrooms, area, location } = data;

    const property = this.create({
      ...data,
      location: {
        type: 'Point',
        coordinates: [data.location.longitude, data.location.latitude],
      },
    });
    await this.save(property);
    

    return this.save(property);
  }

  async deleteProperty(id: string): Promise<void> {
    await this.delete(id);
  }

  async findWithinPolygon(
    polygon: number[][],
    filters: { minPrice?: number; maxPrice?: number; bedrooms?: number; bathrooms?: number }
  ): Promise<{ total: number; matched: Property[]; fallback: Property[] }> {
    if (!polygon || !Array.isArray(polygon) || polygon.length === 0) {
      throw new Error('Polygon input is missing or invalid');
    }
  
    const polygonWKT = `POLYGON((${polygon.map(p => `${p[0]} ${p[1]}`).join(', ')}))`;
  
    const buildFilterSql = (startIndex: number) => {
      const conditions: string[] = [];
      const values: any[] = [];
  
      if (filters?.minPrice !== undefined) {
        conditions.push(`price >= $${startIndex + values.length}`);
        values.push(filters.minPrice);
      }
      if (filters?.maxPrice !== undefined) {
        conditions.push(`price <= $${startIndex + values.length}`);
        values.push(filters.maxPrice);
      }
      if (filters?.bedrooms !== undefined) {
        conditions.push(`bedrooms >= $${startIndex + values.length}`);
        values.push(filters.bedrooms);
      }
      if (filters?.bathrooms !== undefined) {
        conditions.push(`bathrooms >= $${startIndex + values.length}`);
        values.push(filters.bathrooms);
      }
  
      return {
        sql: conditions.length ? `AND ${conditions.join(' AND ')}` : '',
        values,
      };
    };
  
    const countResult = await this.dataSource.query(`
      SELECT COUNT(*) FROM property
    `);
    const total = parseInt(countResult[0].count, 10);
    
  
    const polygonFilters = buildFilterSql(2);
    const matched = await this.dataSource.query(
      `
      SELECT * FROM property
      WHERE ST_Contains(
        ST_GeomFromText($1, 4326),
        location
      )
      ${polygonFilters.sql}
      `,
      [polygonWKT, ...polygonFilters.values]
    );
  
    if (matched.length > 0) {
      return { total, matched, fallback: [] };
    }
  
    const radiusFilters = buildFilterSql(3);
    const fallback = await this.dataSource.query(
      `
      SELECT * FROM property
      WHERE ST_DWithin(
        location,
        ST_Centroid(ST_GeomFromText($1, 4326)),
        $2
      )
      ${radiusFilters.sql}
      `,
      [polygonWKT, 5000, ...radiusFilters.values]
    );
  
    return { total, matched, fallback };
  }
  
  
}
