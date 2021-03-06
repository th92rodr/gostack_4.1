import { getRepository, Repository } from 'typeorm';

import Product from '../entities/Product';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({ name, price, quantity });
    return this.ormRepository.save(product);
  }

  public async findByName(name: string): Promise<Product | undefined> {
    return this.ormRepository.findOne({
      where: { name },
    });
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    return this.ormRepository.findByIds(products);
  }

  public async findById(id: string): Promise<Product | undefined> {
    return this.ormRepository.findOne(id);
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const updatedProducts: Product[] = [];

    for (const product of products) {
      const productToUpdate = await this.ormRepository.findOne(product.id);

      if (!productToUpdate) break;

      productToUpdate.quantity = product.quantity;

      const updatedProduct = await this.ormRepository.save(productToUpdate);
      updatedProducts.push(updatedProduct);
    }

    return updatedProducts;
  }
}

export default ProductsRepository;
