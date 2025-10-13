import { SetMetadata } from '@nestjs/common';

import { ResponseMessage, ResponseMessageKey } from '../response.decorator';

jest.mock('@nestjs/common', () => ({
    ...jest.requireActual('@nestjs/common'),
    SetMetadata: jest.fn().mockImplementation(() => () => {}),
}));

describe('ResponseMessage Decorator', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return a decorator function', () => {
        const result = ResponseMessage('test message');
        expect(typeof result).toBe('function');
    });

    it('should call SetMetadata with correct parameters', () => {
        const testMessage = 'Test response message';
        const decorator = ResponseMessage(testMessage);

        decorator('testTarget', 'testKey', {});

        expect(SetMetadata).toHaveBeenCalledWith(
            ResponseMessageKey,
            testMessage,
        );
    });
});
