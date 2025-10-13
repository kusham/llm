import { SetMetadata, applyDecorators } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { IS_PUBLIC_KEY, Public, PublicThrottle } from '../public.decorator';

jest.mock('@nestjs/common', () => ({
    ...jest.requireActual('@nestjs/common'),
    SetMetadata: jest.fn(() => 'setMetadataDecorator'),
    applyDecorators: jest.fn((...args) => args),
}));

describe('Public Decorators', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Public', () => {
        it('should set metadata with IS_PUBLIC_KEY', () => {
            Public();
            expect(SetMetadata).toHaveBeenCalledWith(IS_PUBLIC_KEY, true);
        });
    });

    describe('PublicThrottle', () => {
        it('should combine Public and Throttle decorators with default values', () => {
            PublicThrottle();

            expect(applyDecorators).toHaveBeenCalledWith(
                'setMetadataDecorator',
                'throttleDecorator',
            );
            expect(Throttle).toHaveBeenCalledWith({
                default: { limit: 10, ttl: 60 },
            });
        });

        it('should use custom values when provided', () => {
            PublicThrottle(20, 30);
            expect(Throttle).toHaveBeenCalledWith({
                default: { limit: 20, ttl: 30 },
            });
        });
    });
});
