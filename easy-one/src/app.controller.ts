import { Body, Controller, Post } from '@nestjs/common';
import { SesSnsEventDto } from './dto/ses-sns-event.dto/ses-sns-event.dto';
import { RecordSerializer } from './serializers/Record.serializer';

import { plainToClass } from 'class-transformer';

@Controller()
export class AppController {
  constructor() {}

  @Post('json')
  sesSnsEvent(@Body() body: SesSnsEventDto) {
    return body.Records.map((record) =>
      plainToClass(RecordSerializer, record, { excludeExtraneousValues: true }),
    );
  }
}
