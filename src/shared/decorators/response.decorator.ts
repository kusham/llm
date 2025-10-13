import { SetMetadata } from '@nestjs/common';

export const ResponseMessageKey = 'ResponseMessageKey';

/**
 * Custom decorator to set a response message in metadata.
 * This can be used to attach a message to the response for later use in the response handling.
 *
 * @param {string} message - The response message to be set in the metadata.
 * @returns A metadata decorator that sets the provided message.
 */
export const ResponseMessage = (message: string) =>
    SetMetadata(ResponseMessageKey, message);
