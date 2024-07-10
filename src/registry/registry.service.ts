import { Injectable, Inject } from '@nestjs/common';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class RegistryService {
  constructor(
    @InjectRedis() private readonly redisClient: Redis,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async check(item: string): Promise<string> {
    this.logger.info(`Checking if item "${item}" is in the registry`);
    const result = (await this.redisClient.sismember('registry', item)) === 1;
    this.logger.info(`Item "${item}" is ${result ? 'in' : 'not in'} the registry`);
    return result ? 'OK' : 'NOT OK';
  }

  async add(item: string): Promise<string> {
    this.logger.info(`Adding item "${item}" to the registry`);
    await this.redisClient.sadd('registry', item);
    this.logger.info(`Item "${item}" added to the registry`); 
    return 'OK'
  }

  async remove(item: string): Promise<string> {
    this.logger.info(`Removing item "${item}" from the registry`);
    await this.redisClient.srem('registry', item);
    this.logger.info(`Item "${item}" removed from the registry`);
    return 'OK'
  }

  async diff(items: string[]): Promise<string[]> {
    this.logger.info(`Calculating diff with items: ${items}`);
    const currentSet = await this.redisClient.smembers('registry');
    const diffResult = items.filter(item => !currentSet.includes(item));
    this.logger.info(`Diff result: ${diffResult}`);
    return diffResult;
  }

  async invert(): Promise<string> {
    this.logger.info('Inverting the registry set');
    const currentSet = await this.redisClient.smembers('registry');
    const invertedSet = await this.redisClient.smembers('inverted');
    
    // Clear the 'registry' set and add items from 'inverted' set
    await this.redisClient.del('registry');
    await Promise.all(invertedSet.map(item => this.redisClient.sadd('registry', item)));
    
    // Clear the 'inverted' set and add items from 'currentSet'
    await this.redisClient.del('inverted');
    await Promise.all(currentSet.map(item => this.redisClient.sadd('inverted', item)));

    this.logger.info('Registry set inverted');
    return 'OK'
  }
}
