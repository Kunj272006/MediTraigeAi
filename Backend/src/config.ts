import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  jwtSecret: process.env.JWT_SECRET || 'meditriage-clinical-jwt-secret-key-2026',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  env: process.env.NODE_ENV || 'development'
};
