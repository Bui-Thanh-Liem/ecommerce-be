import { PGVectorStoreArgs } from '@langchain/community/vectorstores/pgvector';
import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import dotenv from 'dotenv';

//
const isProd = process.env.NODE_ENV === 'production';
dotenv.config({ path: isProd ? '.env' : '.env.dev' });

type PGVectorStoreConfig = PGVectorStoreArgs & {
  dimensions?: number;
};

//
export const vectorStoreConfig: PGVectorStoreConfig = {
  postgresConnectionOptions: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT ? +process.env.POSTGRES_PORT : 5432,
    user: process.env.POSTGRES_USER || 'root',
    password: process.env.POSTGRES_PASSWORD || 'root',
    database: process.env.POSTGRES_DB || 'ecommerce',
  },
  tableName: 'document_chunks',
  columns: {
    idColumnName: 'id',
    vectorColumnName: 'embedding',
    contentColumnName: 'content',
    metadataColumnName: 'metadata',
  },
  distanceStrategy: 'cosine',
  dimensions: 3072,
};

export default registerAs('vectorStore', (): TypeOrmModuleOptions => vectorStoreConfig);

/**
 * distanceStrategy: Chiến lược tính khoảng cách giữa các vector embedding. Có thể là:
 * - 'cosine': Khoảng cách cosine (cosine similarity) (cùng hướng → 1, ngược hướng → -1)
 * - 'euclidean': Khoảng cách Euclidean (khoảng cách hình học)
 * - 'inner_product': Tích vô hướng (inner product)
 *
 * dimensions: Số chiều của vector embedding. Ví dụ, Gemini Embeddings có 3072 chiều.
 */
