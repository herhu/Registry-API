import { Test, TestingModule } from '@nestjs/testing';
import { RegistryController } from './registry.controller';
import { RegistryService } from './registry.service';
import { RedisModule, getRedisToken } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { WINSTON_MODULE_PROVIDER, WinstonModule } from 'nest-winston';
import * as winston from 'winston';

class ItemDto {
  item: string;
}

class ItemsDto {
  items: string[];
}

describe('RegistryController', () => {
  let controller: RegistryController;
  let service: RegistryService;

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
      controllers: [RegistryController],
      providers: [
        RegistryService,
        {
          provide: getRedisToken('default'),
          useValue: new Redis(),
        },
      ],
    }).compile();

    controller = module.get<RegistryController>(RegistryController);
    service = module.get<RegistryService>(RegistryService);

    await service['redisClient'].flushdb(); // Clear Redis before each test
  });

  afterEach(async () => {
    await service['redisClient'].flushdb(); // Clear Redis after each test
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return "OK" if the item is in the set', async () => {
      await service.add('blue');
      const result = await controller.check('blue');
      expect(result).toBe('OK');
    });

    it('should return "NOT OK" if the item is not in the set', async () => {
      const result = await controller.check('red');
      expect(result).toBe('NOT OK');
    });
  });

  describe('add', () => {
    it('should add an item to the set and return "OK"', async () => {
      const result = await controller.add({ item: 'yellow' } as ItemDto);
      expect(result).toBe('OK');
      const checkResult = await controller.check('yellow');
      expect(checkResult).toBe('OK');
    });
  });

  describe('remove', () => {
    it('should remove an item from the set and return "OK"', async () => {
      await service.add('red');
      const result = await controller.remove({ item: 'red' } as ItemDto);
      expect(result).toBe('OK');
      const checkResult = await controller.check('red');
      expect(checkResult).toBe('NOT OK');
    });
  });

  describe('diff', () => {
    it('should return the difference between the submitted set and the current set', async () => {
      await service.add('blue');
      const result = await controller.diff({ items: ['red', 'blue', 'green'] } as ItemsDto);
      expect(result).toEqual(['red', 'green']);
    });
  });

  describe('invert', () => {
    it('should invert the current set and return "OK"', async () => {
      await service.add('brown');
      let result = await controller.invert();
      expect(result).toBe('OK');

      let checkResult = await controller.check('brown');
      expect(checkResult).toBe('NOT OK');

      result = await controller.invert();
      expect(result).toBe('OK');

      checkResult = await controller.check('brown');
      expect(checkResult).toBe('OK');
    });
  });
});
