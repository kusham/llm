import { registerAs } from '@nestjs/config';

import { CONFIG_NAMESPACES } from '../shared/constants';
import { ILLMConfig } from '../shared/interfaces';

export default registerAs(
    CONFIG_NAMESPACES.LLM,
    (): ILLMConfig => ({
        openAIApiKey: process.env.OPENAI_API_KEY!,
        googleApiKey: process.env.GOOGLE_API_KEY!,
    }),
);
