import { Pool } from 'pg';

export const createDatabasePool = (): Pool => {
  return new Pool({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '54320'),
    database: process.env.DATABASE_NAME || 'devdb',
    user: process.env.DATABASE_USER || 'devuser',
    password: process.env.DATABASE_PASSWORD || 'devpass',
    max: 20, // 接続プールサイズ
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
};