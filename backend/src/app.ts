import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import passport from 'passport';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';

import connectDB from './config/database';
import { errorHandler } from './shared/middlewares/errorHandler';
import userRoutes from './modules/user/user.routes';
import accountRoutes from './modules/account/account.routes';
import transactionRoutes from './modules/transaction/transaction.routes';
import logger from './shared/utils/logger';
import { Express } from 'express-serve-static-core';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(passport.initialize());
app.use(cors()); //FIXME:: Fix it to specific origins

//Connect to Database
connectDB();

// Routes
app.use('/api/users', userRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.1',
    info: {
      title: 'LiTally Fintech API',
      version: '1.0.0',
      description: 'API documentation for LiTally Fintech application',
    },
    servers: [
      {
        url: process.env.IS_OFFLINE 
          ? 'http://localhost:3000' 
          : `https://${process.env.API_GATEWAY_ID}.execute-api.${process.env.AWS_REGION}.amazonaws.com/${process.env.STAGE}`,
        description: process.env.IS_OFFLINE ? 'Local server' : 'AWS API Gateway',
      },
      {
        url: 'http://localhost:3000',
        description: 'Explicit Local Server',
      }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            }
        }
    },
    security: [{
        bearerAuth: []
    }]
  },
  apis: ['./src/modules/**/*.routes.ts'],
};

//Swagger UI
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs/', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

//Swagger JSON
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Error handling middleware
app.use(errorHandler);

app.get('/healthcheck', (req, res) => {
  res.status(200).send('OK');
});


//Startup logs
const logRoutes = (app: Express) => {
  app._router.stack.forEach((middleware: { route: { path: any; stack: any[]; }; name: string; handle: { stack: any[]; }; }) => {
    if (middleware.route) { // Routes registered directly on the app
      logger.info(`Route: ${middleware.route.path}`);
      middleware.route.stack.forEach((stackItem) => {
        logger.info(`  ${stackItem.method.toUpperCase()} ${middleware.route.path}`);
      });
    } else if (middleware.name === 'router') { // Routes registered via router
      middleware.handle.stack.forEach((handler) => {
        const routePath = handler.route && handler.route.path;
        if (routePath) {
          handler.route.stack.forEach((stackItem: { method: string; }) => {
            logger.info(`  ${stackItem.method.toUpperCase()} ${routePath}`);
          });
        }
      });
    }
  });
};

// Call the function after all routes have been registered
logRoutes(app);


export default app;