import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';
import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Customer does not exists.');
    }

    const orderProducts = [];
    const productsEntitiesToUpdate = [];

    for (const product of products) {
      const productEntity = await this.productsRepository.findById(product.id);

      if (!productEntity) {
        throw new AppError('Product does not exists.');
      }
      if (productEntity.quantity - product.quantity < 0) {
        throw new AppError('Products with insufficient quantities.');
      }

      const productEntityToUpdate = {
        id: productEntity.id,
        quantity: productEntity.quantity - product.quantity,
      };
      productsEntitiesToUpdate.push(productEntityToUpdate);

      const orderProduct = {
        product_id: productEntity.id,
        price: productEntity.price,
        quantity: product.quantity,
      };
      orderProducts.push(orderProduct);
    }

    await this.productsRepository.updateQuantity(productsEntitiesToUpdate);

    const order = await this.ordersRepository.create({
      customer,
      products: orderProducts,
    });

    return order;
  }
}

export default CreateOrderService;
