import { Test, TestingModule } from '@nestjs/testing';
import { AutomationService } from './automation.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
    flow: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
    },
    flowStats: {
        upsert: jest.fn(),
    },
};

describe('AutomationService', () => {
    let service: AutomationService;
    let prisma: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AutomationService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<AutomationService>(AutomationService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('triggerFlow', () => {
        it('should trigger a flow based on keyword', async () => {
            const mockFlow = {
                id: 'flow-1',
                nodes: [
                    { id: '1', type: 'TRIGGER', data: { keyword: 'hello' } },
                    { id: '2', type: 'MESSAGE', data: { content: 'Hi there!' } },
                ],
                edges: [
                    { id: 'e1-2', source: '1', target: '2' },
                ],
                workspaceId: 'workspace-1', // Added missing field
            };

            mockPrismaService.flow.findFirst.mockResolvedValue(mockFlow);
            mockPrismaService.flow.findUnique.mockResolvedValue(mockFlow);
            mockPrismaService.flow.findUnique.mockResolvedValue(mockFlow);

            const result = await service.processTrigger('workspace-1', {
                type: 'KEYWORD',
                keyword: 'hello',
                contactId: 'contact-1',
            });

            expect(prisma.flow.findFirst).toHaveBeenCalledWith({
                where: {
                    workspaceId: 'workspace-1',
                    isActive: true,
                    triggerType: 'KEYWORD',
                    keywords: { has: 'hello' },
                },
            });

            // Since execution is async/stubbed, we expect it to return true if flow found
            expect(result).toBe(true);
        });

        it('should return false if no flow found', async () => {
            mockPrismaService.flow.findFirst.mockResolvedValue(null);

            const result = await service.processTrigger('workspace-1', {
                type: 'KEYWORD',
                keyword: 'unknown',
                contactId: 'contact-1',
            });

            expect(result).toBe(false);
        });
    });
});
