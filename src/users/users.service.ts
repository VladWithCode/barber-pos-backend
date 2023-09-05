import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import { compare, hash } from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async validateUser(username: string, password: string): Promise<boolean> {
    const user = await this.find({ match: { username } })[0];

    if (!user)
      throw new HttpException(
        `El usuario ${username} no existe`,
        HttpStatus.NOT_FOUND,
      );

    const isPasswordValid = await this.validatePassword(
      password,
      user.password,
    );

    if (!isPasswordValid)
      throw new HttpException('Contraseña incorrecta', HttpStatus.UNAUTHORIZED);

    return isPasswordValid;
  }

  async create(createUserDto: CreateUserDto) {
    const user = new this.userModel(createUserDto);

    user.password = await this.hashPassword(user.password);

    const createdUser = await user.save();

    return {
      id: createdUser._id,
      username: createdUser.username,
      role: createdUser.role,
    };
  }

  async findAll(limit?: number, skip?: number) {
    const findQuery = this.userModel.find().select('-password').lean();

    if (limit) {
      findQuery.limit(limit);
    }

    if (skip) {
      findQuery.skip(skip);
    }

    const foundUsers = await findQuery.exec();

    if (foundUsers.length === 0)
      throw new HttpException(
        {
          message:
            skip > 0
              ? 'No se han encontrado más productos'
              : 'No hay productos en la base de datos',
        },
        HttpStatus.NOT_FOUND,
      );

    return foundUsers;
  }

  async findOne(id: string) {
    const foundUser = await this.userModel
      .findById(id)
      .select('-password')
      .lean();

    if (!foundUser)
      throw new HttpException(
        { message: 'User not found' },
        HttpStatus.NOT_FOUND,
      );

    return foundUser;
  }

  async find({ match }: { match: Partial<User> }): Promise<User[]> {
    const foundUsers = await this.userModel.find(match);

    return foundUsers;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userModel.findById(id);

    user.set({
      ...updateUserDto,
      username: user.username,
    });

    if (user.isModified('password')) {
      user.password = await this.hashPassword(user.password);
    }

    const updatedUser = await user.save();

    return {
      id: updatedUser._id,
      username: updatedUser.username,
      role: updatedUser.role,
    };
  }

  async remove(id: number) {
    const { deletedCount } = await this.userModel.deleteOne({ _id: id });

    if (deletedCount === 0)
      return {
        message: 'El usuario no existe o ya ha sido eliminado',
      };

    return {
      message: 'El usuario ha sido eliminado correctamente',
    };
  }

  async hashPassword(password: string): Promise<string> {
    return await hash(password, 10);
  }

  async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await compare(password, hashedPassword);
  }
}
