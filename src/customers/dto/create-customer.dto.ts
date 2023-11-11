import { SocialMedia } from '../entities/customer.entity';

export class CreateCustomerDto {
  fullname: string;

  phone: string;

  social_media?: SocialMedia;

  social_media_name?: string;

  dob?: Date;

  address?: string;

  reference?: {
    fullname: string;

    phone: string;
  };
}
