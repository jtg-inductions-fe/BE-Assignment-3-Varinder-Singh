import {
    DEFAULT_DB_PORT,
    POSTGRES_DATA_SOURCE,
} from '@constants/database.const';
import { DataSource } from 'typeorm';

export const databaseProvider = [
    {
        provide: POSTGRES_DATA_SOURCE,
        useFactory: async () => {
            const connection = new DataSource({
                type: 'postgres',
                host: process.env.DB_HOST,
                port: parseInt(process.env.DB_PORT || '') || DEFAULT_DB_PORT,
                username: process.env.DB_USERNAME,
                password: `${process.env.DB_PASSWORD}`,
                database: process.env.DB_NAME,
            });

            return connection
                .initialize()
                .then(() => {
                    console.log('Database initialized');
                })
                .catch((err) =>
                    console.log('Could not initialize database : ', err),
                );
        },
    },
];
