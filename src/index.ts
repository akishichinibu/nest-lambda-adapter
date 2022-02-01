import { APIGatewayProxyHandler } from 'aws-lambda';
import { INestApplication, Logger } from '@nestjs/common';
import { LambdaHTTPAdapter } from './adapter';

export function createLambdaHandler(app: Promise<INestApplication>): APIGatewayProxyHandler {
  return (event, context, callback) => {
    const logger = new Logger('LambdaHandler');
    app.then((app) => {
      logger.log('Initialing the app...');
      const adapter = app.getHttpAdapter() as unknown as LambdaHTTPAdapter;
      return app.listen(0, '', () => {
        logger.log('Starting to handler the event');
        adapter.serve(event, context, (...args: Parameters<typeof callback>) => {
          logger.log('Request process done');
          callback(...args);
        });
      });
    });
  };
}


export * from "./decorators";
export * from "./adapter";
