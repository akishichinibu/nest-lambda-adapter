# nestjs-lambda-adapter

A HTTP adapter of Nest.js for AWS Lambda. 

How to use
```typescript
// handler.ts
import { createLambdaHandler, LambdaHTTPAdapter } from 'nestjs-lambda-adapter';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './your.app.module';

const adpter = new LambdaHTTPAdapter();
const app = NestFactory.create(AppModule, adpter);

export const handler = createLambdaHandler(app);
```
