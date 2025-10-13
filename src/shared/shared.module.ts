import { Module } from '@nestjs/common';
import { GoogleGeminiLLMService} from './services';

/**
 * Shared Module
 * Provides common services and utilities used across the application
 * Following the Adapter Pattern for LLM services
 */

export const LLMServiceProvider = {
    provide: 'LLMService',
    useClass: GoogleGeminiLLMService,
};

@Module({
    providers: [
        LLMServiceProvider,
    ],
    exports: [LLMServiceProvider],
})
export class SharedModule {}

