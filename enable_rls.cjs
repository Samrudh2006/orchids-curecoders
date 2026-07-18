const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function enableRLS() {
  const tables = [
    'User',
    'Workspace',
    'SearchQuery',
    'DocumentChunk',
    'AgentResult',
    'Bookmark',
    'SharedWorkspace',
    'Comment',
    'TeamChatMessage',
    'UploadedFile'
  ];
  
  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE public."${table}" ENABLE ROW LEVEL SECURITY;`);
      console.log(`Enabled RLS on ${table}`);
    } catch (e) {
      console.error(`Failed on ${table}:`, e.message);
    }
  }
}

enableRLS().catch(console.error).finally(() => prisma.$disconnect());
