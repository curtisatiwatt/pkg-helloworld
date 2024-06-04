const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const prisma = new PrismaClient();

async function tableExists() {
  const result = await prisma.$queryRaw`
    SELECT EXISTS (
      SELECT 1 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'Repository'
    )
  `;
  return result[0].exists;
}

async function syncDatabase() {
  console.log('Checking if table exists...');
  const exists = await tableExists();

  if (!exists) {
    console.log('Table does not exist. Syncing database...');
    try {
      execSync('npx prisma db push');
      console.log('Database synced successfully.');
    } catch (error) {
      console.error('Error syncing database:', error);
      process.exit(1);
    }
  } else {
    console.log('Table already exists. No need to sync database.');
  }
}

async function main() {
  await syncDatabase();

  const response = await axios.get('https://api.github.com/repos/curtisatiwatt/pkg-helloworld');
  const data = response.data;

  const repository = await prisma.repository.upsert({
    where: { name: data.full_name },
    update: {
      description: data.description,
      stars: data.stargazers_count,
      forks: data.forks_count
    },
    create: {
      name: data.full_name,
      description: data.description,
      stars: data.stargazers_count,
      forks: data.forks_count
    }
  });

  console.log(`Repository ${repository.name} saved to database.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
