/**
 * @fileOverview - uses DBConfig interface for type-checking when accessing application
 * related configuration schemas
 */

export interface IDBConfig {
    host: string;
    port: number;
}
