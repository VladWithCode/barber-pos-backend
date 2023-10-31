import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Subcategory } from './entities/subcategory.entity';
import type { Model } from 'mongoose';
import { asyncHandler } from 'src/utils/helpers';
import { CategoriesService } from 'src/categories/categories.service';

@Injectable()
export class SubcategoriesService {
  constructor(
    @InjectModel(Subcategory.name)
    private readonly subcategoryModel: Model<Subcategory>,
    private readonly categoryService: CategoriesService,
  ) {}

  async create(createSubcategoryDto: CreateSubcategoryDto) {
    const [findError, { category }] = await asyncHandler(
      this.categoryService.findOne(createSubcategoryDto.category),
    );

    if (findError)
      throw new HttpException(
        { message: 'Error al buscar la categoria la base de datos' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    if (!category)
      throw new HttpException(
        {
          message: 'La categoria seleccionada no existe o fue eliminada',
        },
        HttpStatus.BAD_REQUEST,
      );

    const subcategory = new this.subcategoryModel(createSubcategoryDto);

    const [saveError, savedSubcategory] = await asyncHandler(
      subcategory.save(),
    );

    if (saveError)
      throw new HttpException(
        {
          message: 'Ocurrio un error al guardar la subcategoria',
          error: saveError,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    category.set('subcategories', [
      ...category.subcategories,
      savedSubcategory._id,
    ]);

    const [saveCtgError] = await asyncHandler(category.save());

    return {
      message: 'Subcategoria guardada con exito',
      id: savedSubcategory._id,
      saveCtgError,
    };
  }

  async findAll(opts?: { category?: string }) {
    const { category } = opts;
    const filter = {};

    if (category && category.length > 0) filter['category'] = category;

    const [findError, subcategories] = await asyncHandler(
      this.subcategoryModel.find(filter).lean(),
    );

    if (findError)
      throw new HttpException(
        {
          message: 'Ocurrio un error al guardar la subcategoria',
          error: findError,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    if (!subcategories || subcategories.length === 0)
      throw new HttpException(
        {
          message: 'No se han encontrado subcategorias',
        },
        HttpStatus.NOT_FOUND,
      );

    return {
      message: 'Se encontraron ' + subcategories.length + ' subcategorias',
      subcategories,
    };
  }

  async findOne(id: string) {
    const [findError, subcategory] = await asyncHandler(
      this.subcategoryModel.findById(id).lean(),
    );

    if (findError)
      throw new HttpException(
        {
          message: 'Ocurrio un error al guardar la subcategoria',
          error: findError,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    if (!subcategory)
      throw new HttpException(
        {
          message: 'No se ha encontrado la subcategoria solicitada',
        },
        HttpStatus.NOT_FOUND,
      );

    return {
      subcategory,
    };
  }

  async update(id: string, updateSubcategoryDto: UpdateSubcategoryDto) {
    const [findError, subcategory] = await asyncHandler(
      this.subcategoryModel.findById(id),
    );

    if (findError)
      throw new HttpException(
        {
          message: 'Ocurrio un error al guardar la subcategoria',
          error: findError,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    if (!subcategory)
      throw new HttpException(
        {
          message: 'No se ha encontrado la subcategoria solicitada',
        },
        HttpStatus.NOT_FOUND,
      );

    subcategory.set(updateSubcategoryDto);

    const [saveError, savedSubcategory] = await asyncHandler(
      subcategory.save(),
    );

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
      id: savedSubcategory._id,
    };
  }

  async remove(id: string) {
    const [deleteError, deleteResult] = await asyncHandler(
      this.subcategoryModel.deleteOne({ _id: id }),
    );

    if (deleteError)
      throw new HttpException(
        {
          message: 'Error al eliminar la subcategoria',
          error: deleteError,
        },
        HttpStatus.BAD_REQUEST,
      );

    return {
      message: 'Subcategoria eliminada con exito',
      deleted: deleteResult.deletedCount === 1,
    };
  }
}
