/**
 * @fileOverview - uses AppConfig interface for type-checking when accessing application
 * related configuration schemas
 */
export interface IAppConfig {
    env: string;
    port: number;
    host: string;
}
