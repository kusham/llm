export interface IDatabaseSeeder {
    /**
     * Seeds the database with initial/test data
     */
    seed(): Promise<void>;

    /**
     * Clears all data from the database
     */
    clearData(): Promise<void>;
}

