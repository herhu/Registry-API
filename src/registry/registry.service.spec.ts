import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { RegistryService } from './registry.service';
import { RedisModule, getRedisToken } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { WINSTON_MODULE_PROVIDER, WinstonModule } from 'nest-winston';
import * as winston from 'winston';

describe('RegistryService', () => {
  let service: RegistryService;
  let redisClient: Redis;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        RedisModule.forRoot({
          config: {
            host: 'localhost',
            port: 6379,
          },
        }),
        WinstonModule.forRoot({
          transports: [
            new winston.transports.Console({
              format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.ms(),
                winston.format.prettyPrint(),
                winston.format.colorize(),
                winston.format.simple(),
              ),
            }),
          ],
        }),
      ],
      providers: [
        RegistryService,
        {
          provide: getRedisToken('default'),
          useValue: new Redis(),
        },
      ],
    }).compile();

    service = module.get<RegistryService>(RegistryService);
    redisClient = module.get<Redis>(getRedisToken('default'));

    await redisClient.flushdb(); // Clear Redis before each test
  });

  afterEach(async () => {
    await redisClient.flushdb(); // Clear Redis after each test
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('check', () => {
    it('should return "OK" if the item is in the set', async () => {
      await service.add('blue');
      const result = await service.check('blue');
      expect(result).toBe('OK');
    });

    it('should return "NOT OK" if the item is not in the set', async () => {
      const result = await service.check('red');
      expect(result).toBe('NOT OK');
    });

    it('should throw an error if item is not provided', async () => {
      await expect(service.check('')).rejects.toThrow(BadRequestException);
    });
  });

  describe('add', () => {
    it('should add an item to the set and return "OK"', async () => {
      const result = await service.add('yellow');
      expect(result).toBe('OK');
      const checkResult = await service.check('yellow');
      expect(checkResult).toBe('OK');
    });

    it('should throw an error if item is not provided', async () => {
      await expect(service.add('')).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove an item from the set and return "OK"', async () => {
      await service.add('red');
      const result = await service.remove('red');
      expect(result).toBe('OK');
      const checkResult = await service.check('red');
      expect(checkResult).toBe('NOT OK');
    });

    it('should throw an error if item is not provided', async () => {
      await expect(service.remove('')).rejects.toThrow(BadRequestException);
    });
  });

  describe('diff', () => {
    it('should return the difference between the submitted set and the current set', async () => {
      await service.add('blue');
      const result = await service.diff(['red', 'blue', 'green']);
      expect(result).toEqual(['red', 'green']);
    });

    it('should throw an error if items array is empty or not provided', async () => {
      await expect(service.diff([])).rejects.toThrow(BadRequestException);
      await expect(service.diff(null)).rejects.toThrow(BadRequestException);
    });
  });

  describe('invert', () => {
    it('should invert the current set and return "OK"', async () => {
      await service.add('brown');
      let result = await service.invert();
      expect(result).toBe('OK');

      let checkResult = await service.check('brown');
      expect(checkResult).toBe('NOT OK');

      result = await service.invert();
      expect(result).toBe('OK');

      checkResult = await service.check('brown');
      expect(checkResult).toBe('OK');
    });
  });
});
