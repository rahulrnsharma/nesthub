const { Client } = require('pg');
const { faker } = require('@faker-js/faker');

const BATCH_SIZE = 1000;
const TOTAL = 100000;

(async () => {
  const client = new Client({
    host: 'localhost',
    user: 'postgres',
    password: null, 
    database: 'postgres',
    port: 5432,
  });

  await client.connect();

  for (let batch = 0; batch < TOTAL / BATCH_SIZE; batch++) {
    const values = [];

    for (let i = 0; i < BATCH_SIZE; i++) {
      const title = faker.lorem.words(3);
      const description = faker.lorem.sentences(2);
      const price = faker.number.int({ min: 100000, max: 1000000 });
      const bedrooms = faker.number.int({ min: 1, max: 5 });
      const bathrooms = faker.number.int({ min: 1, max: 4 });
      const area = faker.number.int({ min: 500, max: 3000 });
      const lat = faker.location.latitude({ min: 12.9, max: 13.1 });
      const lng = faker.location.longitude({ min: 77.5, max: 77.7 });

      values.push(
        `('${title.replace(/'/g, "''")}', '${description.replace(/'/g, "''")}', ${price}, ${bedrooms}, ${bathrooms}, ${area}, ST_GeomFromText('POINT(${lng} ${lat})', 4326))`
      );
    }

    const query = `
      INSERT INTO property (title, description, price, bedrooms, bathrooms, area, location)
      VALUES ${values.join(',')};
    `;

    console.log(`Inserting batch ${batch + 1}/${TOTAL / BATCH_SIZE}`);
    await client.query(query);
  }

  await client.end();
  console.log('Done seeding 100K properties');
})();
