import * as fs from 'fs';
import { json } from 'node:stream/consumers';
import { MailParser } from 'mailparser';
import fetch from 'node-fetch';
import { load } from 'cheerio';
import puppeteer from 'puppeteer';
import { Injectable } from '@nestjs/common';

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

    const link = this.getLinkContent(html);

    return this.checkPageIsJson(link);
  }

  async getJSONFromWeb(args: Properties): Promise<string> {
    const { html } =
      typeof args === 'string' ? await this.getEmailContent(args) : args;

    const link = this.getLinkContent(html);

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    await page.goto(link);
    const availableLinks = await page.evaluate(() => {
      const linkNodes = document.querySelectorAll('a');

      return Array.from(linkNodes).map((linkNode) => {
        const baseURL = document.location.origin;

        const href = linkNode.getAttribute('href');

        return href.startsWith('http') ? href : new URL(href, baseURL).href;
      });
    });

    browser.close();

    for (const availableLink of availableLinks) {
      const jsonContent = await this.checkPageIsJson(availableLink);

      if (jsonContent) return jsonContent;
    }
  }

  async getEmailContent(path: string) {
    const readStream = await this.getReadStream(path);

    return new Promise<EmailContent>((resolve) => {
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

  private getLinkContent(html: string) {
    const $ = load(html);
    return $('a').attr('href');
  }
}
