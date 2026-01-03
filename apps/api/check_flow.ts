
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const flow = await prisma.flow.findFirst({
            orderBy: { updatedAt: 'desc' },
        });

        if (!flow) {
            console.log('No flows found.');
            return;
        }

        console.log(`Latest Flow: ${flow.name} (${flow.id})`);
        const nodes = flow.nodes as any[];
        const triggerNode = nodes.find((n: any) => n.type === 'TRIGGER');

        if (triggerNode) {
            console.log('Trigger Node Data:', JSON.stringify(triggerNode.data, null, 2));
        } else {
            console.log('No TRIGGER node found. All Nodes:', JSON.stringify(nodes, null, 2));
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
