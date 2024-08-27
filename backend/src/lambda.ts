import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import serverless from 'serverless-http';
import dotenv from 'dotenv';
import logger from './shared/utils/logger';

// Load environment variables from .env file when running locally
if (process.env.IS_OFFLINE) {
  dotenv.config();
}

import app from './app';

const serverlessHandler = serverless(app);

const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
  try {
    const result = await serverlessHandler(event, context);
    return result as any;
  } catch (error) {
    logger.error('Lambda execution error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};

export { handler };