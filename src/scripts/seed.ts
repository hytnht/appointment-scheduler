import { NestFactory } from '@nestjs/core';
import { SeedModule } from '@src/database/seed.module';
import { SeedService } from '@src/database/seed.service';
import 'reflect-metadata';
import { initializeTransactionalContext, StorageDriver } from 'typeorm-transactional';

async function run(): Promise<void> {
  initializeTransactionalContext({ storageDriver: StorageDriver.AUTO });
  const app = await NestFactory.createApplicationContext(SeedModule);
  try {
    const seeder = app.get(SeedService);
    await seeder.run();
    console.log('Seed done');
  } finally {
    await app.close();
  }
}

run().catch((error: unknown) => {
  console.error('Seed failed', error);
  process.exit(1);
});
