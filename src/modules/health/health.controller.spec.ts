import { HealthCheckService, MemoryHealthIndicator } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';

import { HealthController } from './health.controller';

describe('HealthController', () => {
    let healthController: HealthController;
    let healthCheckService: HealthCheckService;
    let memoryHealthIndicator: MemoryHealthIndicator;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [HealthController],
            providers: [
                {
                    provide: HealthCheckService,
                    useValue: {
                        check: jest.fn(),
                    },
                },
                {
                    provide: MemoryHealthIndicator,
                    useValue: {
                        checkHeap: jest.fn(),
                    },
                },
            ],
        }).compile();

        healthController = module.get<HealthController>(HealthController);
        healthCheckService = module.get<HealthCheckService>(HealthCheckService);
        memoryHealthIndicator = module.get<MemoryHealthIndicator>(
            MemoryHealthIndicator,
        );
    });

    describe('check', () => {
        it('should return health check result', async () => {
            const result = { status: 'ok' };

            (memoryHealthIndicator.checkHeap as jest.Mock).mockImplementation(
                () => ({
                    memory_heap: { status: 'up', usedHeap: 1000000 },
                }),
            );

            (healthCheckService.check as jest.Mock).mockImplementation(() => {
                return Promise.resolve(result);
            });

            await expect(healthController.check()).resolves.toEqual(result);
        });
    });
});
