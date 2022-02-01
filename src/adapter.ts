import { HttpException, HttpStatus, NestApplicationOptions, RequestMethod } from '@nestjs/common';
import { CorsOptions, CorsOptionsDelegate } from '@nestjs/common/interfaces/external/cors-options.interface';
import { AbstractHttpAdapter } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { APIGatewayProxyCallback, APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { LambdaHandlerRouter } from './route';

class LambdaDummyService {
  once(...args: any[]) { }
  address(...args: any[]) { }
}

export interface LambdaEventBasedRequest {
  body: string | Record<string, any>;
  headers: Record<string, string | string[]>;
  params: Record<string, string>;
  query: Record<string, string | string[]>;
  event: APIGatewayProxyEvent;
  context: Context;
}

export interface LambdaEventBasedResponse extends APIGatewayProxyResult { }

export class LambdaHTTPAdapter extends AbstractHttpAdapter<
  LambdaDummyService,
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> {
  private readonly logger = new Logger('LambdaHTTPAdapter');

  constructor() {
    super();
    const instance = new LambdaHandlerRouter();
    this.setInstance(instance);
  }

  serve(event: APIGatewayProxyEvent, context: Context, callback: APIGatewayProxyCallback) {
    const method = this.getRequestMethod(event);
    const url = this.getRequestUrl(event);

    const instance = this.getInstance();

    const result: APIGatewayProxyResult = {
      statusCode: 0,
      body: "",
    };

    const f = instance.find(method, event.resource);

    if (f === null) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    f(this.wrapToRequestEvent(event, context), result, (...args: any[]) => { })
      .then(() => callback(undefined, result))
      .catch((error: any) => callback(error, result));
  }

  protected wrapToRequestEvent(event: APIGatewayProxyEvent, context: Context) {
    return {
      body: this.getRequestBody(event),
      headers: this.getRequestHeader(event),
      params: this.getRequestParams(event),
      query: this.getRequestQueryParameters(event),
      event,
      context,
    };
  }

  protected getRequestHeader(event: APIGatewayProxyEvent) {
    const entities = [
      ...Object.entries(event.headers).map(([k, v]) => [k.toLowerCase(), v]),
      ...Object.entries(event.multiValueHeaders)
        .filter(([_, v]) => v?.length ?? 0 > 1)
        .map(([k, v]) => [k.toLowerCase(), v]),
    ];
    return Object.fromEntries(entities);
  }

  protected getRequestParams(event: APIGatewayProxyEvent) {
    return event.pathParameters;
  }

  protected getRequestQueryParameters(event: APIGatewayProxyEvent) {
    const entities = [
      ...Object.entries(event.queryStringParameters ?? {}),
      ...Object.entries(event.multiValueQueryStringParameters ?? {}).filter(([_, v]) => v?.length ?? 0 > 1),
    ];
    return Object.fromEntries(entities);
  }

  getInstance<T = LambdaHandlerRouter>(): T {
    return this.instance;
  }

  close() {
    console.log('The AwsAdapter stop');
  }

  initHttpServer(options: NestApplicationOptions) {
    this.setHttpServer(new LambdaDummyService());
  }

  getRequestHostname(event: APIGatewayProxyEvent) {
    return event.requestContext.domainName;
  }

  getRequestMethod(event: APIGatewayProxyEvent) {
    return event.httpMethod;
  }

  getRequestBody(event: APIGatewayProxyEvent) {
    if (event.isBase64Encoded) {
      return Buffer.from(event.body ?? "", 'base64').toString();
    } else {
      return event.body;
    }
  }

  getRequestUrl(event: APIGatewayProxyEvent) {
    return event.path;
  }

  status(response: APIGatewayProxyResult, statusCode: number) {
    response.statusCode = statusCode;
  }

  reply(response: APIGatewayProxyResult, body: any, statusCode?: number) {
    statusCode && this.status(response, statusCode);
    response.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  render(response: any, view: string, options: any) {
    throw new Error('Method not implemented.');
  }

  redirect(response: any, statusCode: number, url: string) {
    throw new Error('Method not implemented.');
  }

  setErrorHandler(handler: Function, prefix?: string) { }

  setNotFoundHandler(handler: Function, prefix?: string) { }

  setHeader(response: APIGatewayProxyResult, name: string, value: string) {
    if (response.headers === undefined) {
      response.headers = {};
    }
    response.headers[name] = value;
  }

  registerParserMiddleware(prefix?: string) { }

  enableCors(options: CorsOptions | CorsOptionsDelegate<any>, prefix?: string) { }

  useStaticAssets(...args: any[]) {
    throw new Error('Method not implemented.');
  }

  setViewEngine(engine: string) {
    throw new Error('Method not implemented.');
  }

  createMiddlewareFactory(
    requestMethod: RequestMethod,
  ): ((path: string, callback: Function) => any) | Promise<(path: string, callback: Function) => any> {
    throw new Error('Method not implemented.');
  }

  getType(): string {
    return 'aws-lambda';
  }
}
