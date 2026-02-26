import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const reply = ctx.getResponse<FastifyReply>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const response = exception.getResponse();
            message =
                typeof response === 'string'
                    ? response
                    : (response as Record<string, unknown>).message as string || exception.message;
        } else if (exception instanceof Error) {
            this.logger.error(`Unhandled error: ${exception.message}`, exception.stack);
            try {
                const fs = require('node:fs');
                const logMessage = `\n[${new Date().toISOString()}] Unhandled error: ${exception.message}\nStack: ${exception.stack}\n`;
                fs.appendFileSync('error.log', logMessage);
            } catch (err) {
                // Ignore logging errors
            }
        }

        reply.status(status).send({
            statusCode: status,
            message: Array.isArray(message) ? message : [message],
            timestamp: new Date().toISOString(),
        });
    }
}