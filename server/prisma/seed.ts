import { PrismaClient, CategoryType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding default categories to database...');

  const incomeCategories = [
    { name: 'Salary', type: CategoryType.INCOME },
    { name: 'Freelance', type: CategoryType.INCOME },
    { name: 'Investment', type: CategoryType.INCOME },
    { name: 'Other Income', type: CategoryType.INCOME },
  ];

  const expenseCategories = [
    { name: 'Housing', type: CategoryType.EXPENSE },
    { name: 'Food', type: CategoryType.EXPENSE },
    { name: 'Transportation', type: CategoryType.EXPENSE },
    { name: 'Shopping', type: CategoryType.EXPENSE },
    { name: 'Entertainment', type: CategoryType.EXPENSE },
    { name: 'Health', type: CategoryType.EXPENSE },
    { name: 'Travel', type: CategoryType.EXPENSE },
    { name: 'Bills', type: CategoryType.EXPENSE },
    { name: 'Education', type: CategoryType.EXPENSE },
    { name: 'Other', type: CategoryType.EXPENSE },
  ];

  for (const category of incomeCategories) {
    await prisma.category.upsert({
      where: {
        name_type: {
          name: category.name,
          type: category.type,
        },
      },
      update: {},
      create: category,
    });
    console.log(`Created category: ${category.name}`);
  }

  for (const category of expenseCategories) {
    await prisma.category.upsert({
      where: {
        name_type: {
          name: category.name,
          type: category.type,
        },
      },
      update: {},
      create: category,
    });
    console.log(`Created category: ${category.name}`);
  }

  console.log('✨ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
