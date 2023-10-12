import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import mockedShortJSON from '../__mocks__/shortJson';
import mockedLongJSON from '../__mocks__/longJson';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should throw BadRequestException when url param is missing', async () => {
      expect.assertions(2);
      try {
        await appController.getJson();
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('url param is missing');
      }
    });

    it('should throw NotFoundException when file not found', async () => {
      expect.assertions(1);
      try {
        await appController.getJson('example');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('should return json when found email file with json attached', async () => {
      expect(
        await appController.getJson(
          '../challenge/example-emails/JSON file attached.eml',
        ),
      ).toEqual(mockedShortJSON);
    });

    it('should return json when found email file with json in body link', async () => {
      expect(
        await appController.getJson(
          '../challenge/example-emails/JSON in the body as a link.eml',
        ),
      ).toEqual(mockedShortJSON);
    });

    it('should return json when found email file with a link that leads to a web where there is a link that leads to the actual JSON', async () => {
      expect(
        await appController.getJson(
          '../challenge/example-emails/JSON in a link that leads to a web where there is a link that leads to the actual JSON.eml',
        ),
      ).toEqual(mockedLongJSON);
    }, 12000);

    it('should return json when found a link to an email file with json attached', async () => {
      expect(
        await appController.getJson(
          'https://raw.githubusercontent.com/Anb98/NestJS-Test/master/challenge/example-emails/JSON%20file%20attached.eml',
        ),
      ).toEqual(mockedShortJSON);
    });
  });
});
