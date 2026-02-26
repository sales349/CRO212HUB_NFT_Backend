import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { z } from 'zod';

const nonceSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
});

const verifySchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  signature: z.string().min(1),
  nonce: z.string().min(1),
});

type NonceDto = z.infer<typeof nonceSchema>;
type VerifyDto = z.infer<typeof verifySchema>;

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('nonce')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request authentication nonce' })
  @ApiResponse({ status: 200, description: 'Nonce generated' })
  async nonce(
    @Body(new ZodValidationPipe(nonceSchema)) body: NonceDto,
  ) {
    const nonce = await this.authService.generateNonce(body.walletAddress);
    return { nonce };
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify signature and receive JWT' })
  @ApiResponse({ status: 200, description: 'JWT token issued' })
  @ApiResponse({ status: 401, description: 'Invalid signature or nonce' })
  async verify(
    @Body(new ZodValidationPipe(verifySchema)) body: VerifyDto,
  ) {
    const token = await this.authService.verifyAndIssueToken(
      body.walletAddress,
      body.signature,
      body.nonce,
    );
    return { token };
  }
}