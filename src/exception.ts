import { Catch, HttpException, ExceptionFilter, ArgumentsHost, HttpStatus } from "@nestjs/common";
import { LambdaEventBasedResponse } from "./adapter";


@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<LambdaEventBasedResponse>();

    response.statusCode = exception.getStatus();
    response.body = JSON.stringify({
      "error": exception.message,
    });
  }
}
