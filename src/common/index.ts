import { ConsoleLogger } from '@nestjs/common';
import { KafkaOptions, Transport } from '@nestjs/microservices';
import { displayName } from '../../package.json';
import { config } from './config';

export { BaseController } from './base.controller';
export { BaseService } from './base.service';
export * as config from './config';
export { EmailService } from './email.service';
export * as interfaces from './interfaces';
export * as MESSAGES from './messages';

export const logger = new ConsoleLogger(displayName);

const KAFKA_BROKER_URL = '127.0.0.1:9092';

export const microserviceConfig: KafkaOptions = {
  transport: Transport.KAFKA,
  options: {
    client: { brokers: [KAFKA_BROKER_URL] },
    consumer: { groupId: '1', allowAutoTopicCreation: true },
  },
};
