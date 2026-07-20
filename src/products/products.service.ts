import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma.service';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService {
  constructor(private prismaService: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const product = await this.prismaService.product.create({
      data: createProductDto,
    });
    return product;
  }

  //* Get all products
  //* @param paginationDto
  //* @returns
  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10, available } = paginationDto;
    const where = { ...(available !== undefined && { available }) };
    const totalPages = await this.prismaService.product.count({
      where,
    });
    const lastpage = Math.ceil(totalPages / limit);
    return {
      data: await this.prismaService.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where,
      }),
      meta: {
        page,
        limit,
        totalPages,
        lastpage,
      },
    };
  }

  //* Get product by id
  //* @param id
  //* @returns
  async findOne(id: number) {
    const product = await this.prismaService.product.findUnique({
      where: {
        id,
        available: true,
      },
    });
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return product;
  }

  //* Update product by id
  //* @param id
  //* @param updateProductDto
  //* @returns
  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return this.prismaService.product.update({
      where: {
        id,
      },
      data: updateProductDto,
    });
  }

  //* Delete product by id
  //* @param id
  //* @returns
  async remove(id: number) {
    const product = await this.findOne(id);
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    /* return this.prismaService.product.delete({
      where: {
        id,
      },
    }); */
    return await this.prismaService.product.update({
      where: {
        id,
      },
      data: {
        available: false,
      },
    });
  }
}
