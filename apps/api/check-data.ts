
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const workspaceCount = await prisma.workspace.count();
        console.log(`Total Workspaces: ${workspaceCount}`);

        const workspaces = await prisma.workspace.findMany({ take: 5 });
        console.log('Sample Workspaces:', JSON.stringify(workspaces, null, 2));

        const adminCount = await prisma.adminUser.count();
        console.log(`Total Admin Users: ${adminCount}`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
