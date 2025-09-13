import { Injectable } from '@nestjs/common';

@Injectable()
export class GatewayService {
  getHealth(): string {
    return 'Gateway is healthy';
  }
}
