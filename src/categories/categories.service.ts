import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from './entities/category.entity';
import type { Model } from 'mongoose';
import { asyncHandler } from 'src/utils/helpers';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const category = new this.categoryModel(createCategoryDto);

    const [saveError, savedCategory] = await asyncHandler(category.save());

    if (saveError)
      throw new HttpException(
        {
          message: 'Error al guardar la categoria',
          error: saveError,
        },
        HttpStatus.BAD_REQUEST,
      );

    return {
      message: 'Categoria guardada con exito',
      id: savedCategory._id,
    };
  }

  async findAll() {
    const categories = await this.categoryModel.find({}).lean();

    if (!categories || categories.length === 0)
      throw new HttpException(
        { message: 'No se encontraron categorias' },
        HttpStatus.NOT_FOUND,
      );

    return {
      message: 'Se encontraron ' + categories.length + ' categorias',
      categories,
    };
  }

  async findOne(id: string) {
    const [findError, category] = await asyncHandler(
      this.categoryModel.findById(id).lean(),
    );

    if (findError)
      throw new HttpException(
        {
          message: 'Ocurrio un error al buscar la categoria',
          error: findError,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    if (!category)
      throw new HttpException(
        { message: 'No se encontró la categoria solicitada' },
        HttpStatus.NOT_FOUND,
      );

    return {
      category,
    };
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const [findError, category] = await asyncHandler(
      this.categoryModel.findById(id),
    );

    if (findError)
      throw new HttpException(
        {
          message: 'Ocurrio un error al buscar la categoria',
          error: findError,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    if (!category)
      throw new HttpException(
        { message: 'No se encontró la categoria solicitada' },
        HttpStatus.NOT_FOUND,
      );

    category.set(updateCategoryDto);

    const [saveError, savedCategory] = await asyncHandler(category.save());

    if (saveError)
      throw new HttpException(
        {
          message: 'Error al guardar la categoria',
          error: saveError,
        },
        HttpStatus.BAD_REQUEST,
      );

    return {
      message: 'Categoria actualizada con exito',
      id: savedCategory._id,
    };
  }

  async remove(id: string) {
    const [deleteError, deleteResult] = await asyncHandler(
      this.categoryModel.deleteOne({ _id: id }),
    );

    if (deleteError)
      throw new HttpException(
        {
          message: 'Error al eliminar la categoria',
          error: deleteError,
        },
        HttpStatus.BAD_REQUEST,
      );

    return {
      message: 'Categoria eliminada con exito',
      deleted: deleteResult.deletedCount === 1,
    };
  }
}
