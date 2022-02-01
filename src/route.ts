import { Logger } from '@nestjs/common';

type AsyncHandler = (...args: any[]) => Promise<any>;

export class LambdaHandlerRouter {
  private readonly logger = new Logger('LambdaRouteRegister');
  pathMapping: Map<string, AsyncHandler>;

  constructor() {
    this.pathMapping = new Map();
  }

  protected convertToApiGatewayUrl(path: string) {
    return path
      .split('/')
      .map((r) => r.replaceAll(/:(\w+)/ig, (p) => `{${p.slice(1)}}`))
      .join('/');
  }

  find(method: string, awsResourcePath: string) {
    return this.pathMapping.get(`${method}@${awsResourcePath}`) ?? null;
  }

  protected on(method: string, path: string, handler: AsyncHandler) {
    const gatewayPath = this.convertToApiGatewayUrl(path);
    this.logger.log(`Request hanlder attached [${method}]{${path}} -> [${gatewayPath}]`);
    this.pathMapping.set(`${method}@${gatewayPath}`, handler);
  }

  get(path: string, handler: AsyncHandler) {
    this.on('GET', path, handler);
  }

  post(path: string, handler: AsyncHandler) {
    this.on('POST', path, handler);
  }

  put(path: string, handler: AsyncHandler) {
    this.on('PUT', path, handler);
  }

  patch(path: string, handler: AsyncHandler) {
    this.on('PATCH', path, handler);
  }

  options(path: string, handler: AsyncHandler) {
    this.on('OPTIONS', path, handler);
  }

  head(path: string, handler: AsyncHandler) {
    this.on('HEAD', path, handler);
  }

  delete(path: string, handler: AsyncHandler) {
    this.on('DELETE', path, handler);
  }

  listen(port: any, number: any, callback: (...args: any[]) => any) {
    console.log('The AwsAdapter begins to process the request event');
    callback();
  }
}
