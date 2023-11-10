import { PartialType } from '@nestjs/mapped-types';
import { CreateWhatsappApiDto } from './create-whatsapp-api.dto';

export class UpdateWhatsappApiDto extends PartialType(CreateWhatsappApiDto) {}
