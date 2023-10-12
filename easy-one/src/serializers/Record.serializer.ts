import { Expose, Transform } from 'class-transformer';
import { SesSnsEventDto } from '../dto/ses-sns-event.dto/ses-sns-event.dto';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

type SesSnsEvenRecord = SesSnsEventDto['Records'][0];

export class RecordSerializer {
  @Expose()
  @Transform(
    ({ obj }: { obj: SesSnsEvenRecord }) =>
      obj.ses.receipt.spamVerdict.status === 'PASS',
  )
  spam: boolean;

  @Expose()
  @Transform(
    ({ obj }: { obj: SesSnsEvenRecord }) =>
      obj.ses.receipt.virusVerdict.status === 'PASS',
  )
  virus: boolean;

  @Expose()
  @Transform(
    ({ obj }: { obj: SesSnsEvenRecord }) =>
      obj.ses.receipt.spfVerdict.status === 'PASS' &&
      obj.ses.receipt.dkimVerdict.status === 'PASS' &&
      obj.ses.receipt.dmarcVerdict.status === 'PASS',
  )
  dns: boolean;

  @Expose()
  @Transform(({ obj }: { obj: SesSnsEvenRecord }) =>
    format(parseISO(obj.ses.mail.timestamp), 'MMMM', { locale: es }),
  )
  mes: string;

  @Expose()
  @Transform(
    ({ obj }: { obj: SesSnsEvenRecord }) =>
      obj.ses.receipt.processingTimeMillis > 1000,
  )
  retrasado: boolean;

  @Expose()
  @Transform(
    ({ obj }: { obj: SesSnsEvenRecord }) => obj.ses.mail.source.split('@')[0],
  )
  emisor: string;

  @Expose()
  @Transform(({ obj }: { obj: SesSnsEvenRecord }) =>
    obj.ses.mail.destination.map((email) => email.split('@')[0]),
  )
  receptor: string[];
}
