
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.count();
        const workspaces = await prisma.workspace.count();
        const flows = await prisma.flow.findMany();

        console.log('Total Users:', users);
        console.log('Total Workspaces:', workspaces);
        console.log('Total Flows:', flows.length);

        flows.forEach(f => {
            console.log(`ID: ${f.id}, Name: ${f.name}, Active: ${f.isActive}, Trigger: ${f.triggerType}, Workspace: ${f.workspaceId}`);
        });
    } catch (error) {
        console.error('Error connecting to DB:', error);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
