import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HealthCheckService, MemoryHealthIndicator } from '@nestjs/terminus';

import { Public } from '../../shared/decorators';
import { ResponseInterceptor } from '../../shared/interceptors';

@Controller({ path: 'health', version: '1' })
@UseInterceptors(ResponseInterceptor)
@Public()
@ApiTags('health')
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private memory: MemoryHealthIndicator,
    ) {}

    /**
     * Endpoint: GET /check
     * Performs a health check on the application's memory usage.
     *
     * @returns Health check result indicating if memory usage is within limits.
     */
    @Get()
    check() {
        return this.health.check([
            () => this.memory.checkHeap('memory_heap', 256 * 1024 * 1024),
        ]);
    }
}
