import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const userId = '7549bd14-c8ba-4ed4-9424-8584d4b324e0';

    console.log('--- Workspaces ---');
    const workspaces = await prisma.workspace.findMany({
        select: { id: true, name: true }
    });
    workspaces.forEach(w => console.log(`Workspace: ${w.id} (${w.name})`));

    console.log('\n--- Members for User ' + userId + ' ---');
    const members = await prisma.workspaceMember.findMany({
        where: { userId },
        select: { workspaceId: true, role: true }
    });
    members.forEach(m => console.log(`Member of: ${m.workspaceId} (${m.role})`));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
