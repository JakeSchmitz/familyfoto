import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultTags = [
  'Wildlife',
  'Family',
  'Bird',
  'Sealife'
];

async function main() {
  console.log('Starting seed...');

  // Create default tags
  for (const tagName of defaultTags) {
    const normalizedTagName = tagName.trim().toLowerCase();
    await prisma.tag.upsert({
      where: { name: normalizedTagName },
      update: {}, // Don't update if exists
      create: { name: normalizedTagName }
    });
  }

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 