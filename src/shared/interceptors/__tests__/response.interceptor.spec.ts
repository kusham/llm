import { CallHandler, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';

import { ResponseMessageKey } from '../../decorators';

import { ResponseInterceptor } from '../response.interceptor';

describe('ResponseInterceptor', () => {
    let interceptor: ResponseInterceptor<any>;
    let reflector: Reflector;
    let mockExecutionContext: ExecutionContext;
    let mockCallHandler: CallHandler;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ResponseInterceptor,
                {
                    provide: Reflector,
                    useValue: {
                        get: jest.fn(),
                    },
                },
            ],
        }).compile();

        interceptor = module.get<ResponseInterceptor<any>>(ResponseInterceptor);
        reflector = module.get<Reflector>(Reflector);

        mockExecutionContext = {
            switchToHttp: jest.fn().mockReturnValue({
                getResponse: jest.fn().mockReturnValue({
                    statusCode: 200,
                }),
            }),
            getHandler: jest.fn(),
        } as unknown as ExecutionContext;

        mockCallHandler = {
            handle: jest.fn().mockReturnValue(of('test data')),
        };
    });

    it('should be defined', () => {
        expect(interceptor).toBeDefined();
    });

    describe('intercept', () => {
        it('should transform response with default message when no decorator is set', done => {
            jest.spyOn(reflector, 'get').mockReturnValue(undefined);

            interceptor
                .intercept(mockExecutionContext, mockCallHandler)
                .subscribe({
                    next: response => {
                        expect(response).toEqual({
                            data: 'test data',
                            statusCode: 200,
                            message: '',
                        });
                        done();
                    },
                });
        });

        it('should transform response with custom message when decorator is set', done => {
            const customMessage = 'Custom success message';
            jest.spyOn(reflector, 'get').mockReturnValue(customMessage);

            interceptor
                .intercept(mockExecutionContext, mockCallHandler)
                .subscribe({
                    next: response => {
                        expect(response).toEqual({
                            data: 'test data',
                            statusCode: 200,
                            message: customMessage,
                        });
                        done();
                    },
                });
        });

        it('should call reflector with correct parameters', () => {
            const getHandlerSpy = jest.spyOn(
                mockExecutionContext,
                'getHandler',
            );
            const reflectorSpy = jest.spyOn(reflector, 'get');

            interceptor.intercept(mockExecutionContext, mockCallHandler);

            expect(getHandlerSpy).toHaveBeenCalled();
            expect(reflectorSpy).toHaveBeenCalledWith(
                ResponseMessageKey,
                mockExecutionContext.getHandler(),
            );
        });
    });
});
