import {
  IsIn,
  IsString,
  MaxLength,
  MinLength,
  NotContains,
} from 'class-validator';
import { UserRole, UserRoles } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  @MaxLength(12, {
    message: 'El nombre de usuario no puede contener más de 12 caracteres',
  })
  @NotContains(' ', {
    message: 'El nombre de usuario no puede contener espacios',
  })
  username: string;

  @IsString()
  @MinLength(8, {
    message: 'La contraseña debe contener al menos 8 caracteres',
  })
  password: string;

  @IsString()
  @MaxLength(50, {
    message: 'El nombre no puede contener más de 50 caracteres',
  })
  display_name: string;

  @IsString()
  @IsIn(Object.values(UserRoles), {
    message: 'El rol no es válido (debe ser admin o usuario)',
  })
  role: UserRole;

  birth_date?: Date;
}
