import {
  Controller,
  Get,
  Query,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('get-json')
  async getJson(@Query('url') url: string): Promise<string> {
    if (!url) throw new BadRequestException('url param is missing');

    const emailContent = await this.appService.getEmailContent(url);
    if (emailContent.json) return emailContent.json;

    const JSONFromLink = await this.appService.getJSONFromLink(emailContent);
    if (JSONFromLink) return JSONFromLink;

    const JSONFromWeb = await this.appService.getJSONFromWeb(emailContent);
    if (JSONFromWeb) return JSONFromWeb;

    throw new NotFoundException('JSON not found');
  }
}
