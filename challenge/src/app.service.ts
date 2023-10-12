import * as fs from 'fs';
import { json } from 'node:stream/consumers';
import { MailParser } from 'mailparser';
import fetch from 'node-fetch';
import { load } from 'cheerio';
// import puppeteer from 'puppeteer';
import { Injectable, NotFoundException } from '@nestjs/common';

interface EmailContent {
  html: string;
  json: string;
}
type Properties = string | EmailContent;
@Injectable()
export class AppService {
  async getJSONFromLink(args: Properties): Promise<string> {
    const { html } =
      typeof args === 'string' ? await this.getEmailContent(args) : args;

    const link = this.getLinksContent(html)[0];

    return this.checkPageIsJson(link);
  }

  async getJSONFromWeb(args: Properties): Promise<string> {
    const { html } =
      typeof args === 'string' ? await this.getEmailContent(args) : args;

    const mainLink = this.getLinksContent(html)[0];

    const text = await (await fetch(mainLink)).text();
    const availableLinks = await this.getLinksContent(text).map((link) =>
      link.startsWith('http') ? link : new URL(link, mainLink).href,
    );

    for (const availableLink of availableLinks) {
      const jsonContent = await this.checkPageIsJson(availableLink);

      if (jsonContent) return jsonContent;
    }
  }

  async getEmailContent(path: string) {
    const readStream = await this.getReadStream(path);

    return new Promise<EmailContent>((resolve, reject) => {
      readStream.on('error', () => {
        reject(new NotFoundException('JSON not found'));
      });

      readStream.pipe(new MailParser()).on('data', async (data) => {
        if (data.type === 'text') {
          resolve({
            html: data.html,
            json: null,
          });
        }
        if (
          data.type === 'attachment' &&
          data.contentType === 'application/json'
        ) {
          resolve({
            html: null,
            json: (await json(data.content)) as string,
          });
          data.content.on('end', () => data.release());
        }
      });
    });
  }

  // Private methods
  private isUrl(str: string) {
    return str.startsWith('http');
  }

  private async getReadStream(path: string) {
    return this.isUrl(path)
      ? (await fetch(path)).body
      : fs.createReadStream(path);
  }

  private async checkPageIsJson(link: string) {
    return fetch(link)
      .then((res) => res.json())
      .catch(() => {});
  }

  private getLinksContent(html: string) {
    const $ = load(html);
    return $('a')
      .map(function () {
        return $(this).attr('href');
      })
      .toArray();
  }
}
