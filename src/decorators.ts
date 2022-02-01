import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { LambdaEventBasedRequest } from './adapter';

const createLambdaParamDecorator = (f: (request: LambdaEventBasedRequest) => any) => {
  return createParamDecorator((data: unknown, ctx: ExecutionContext) =>
    f(ctx.switchToHttp().getRequest<LambdaEventBasedRequest>()),
  );
};

export const LambdaEvent = createLambdaParamDecorator((r) => r.event);

export const LambdaContext = createLambdaParamDecorator((r) => r.context);

export const Stage = createLambdaParamDecorator((r) => r.event.stageVariables);
