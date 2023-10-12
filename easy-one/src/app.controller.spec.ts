import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import mockBodyRequest from './__mocks__/sessSnsEvent';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return a json with calculated data', () => {
      expect(appController.sesSnsEvent(mockBodyRequest)).toEqual([
        {
          dns: true,
          emisor: '61967230-7A45-4A9D-BEC9-87CBCF2211C9',
          mes: 'septiembre',
          receptor: ['recipient'],
          retrasado: false,
          spam: true,
          virus: true,
        },
      ]);
    });
  });
});
