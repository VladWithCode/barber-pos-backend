import { SocialMedia } from '../entities/customer.entity';

export class CreateCustomerDto {
  fullname: string;

  phone: string;

  social_media: SocialMedia;

  dob: Date;
}
