import { getRepository, Repository } from 'typeorm';

import IOrdersRepository from '@modules/orders/repositories/IOrdersRepository';
import ICreateOrderDTO from '@modules/orders/dtos/ICreateOrderDTO';
import Order from '../entities/Order';
import OrdersProducts from '../entities/OrdersProducts';

class OrdersRepository implements IOrdersRepository {
  private ormRepository: Repository<Order>;

  constructor() {
    this.ormRepository = getRepository(Order);
  }

  public async create({ customer, products }: ICreateOrderDTO): Promise<Order> {
    const order = this.ormRepository.create({ customer });
    await this.ormRepository.save(order);

    const ordersProductsList: OrdersProducts[] = [];
    const ordersProductsRepository = getRepository(OrdersProducts);

    products.forEach(product => {
      const ordersProducts = ordersProductsRepository.create({
        order_id: order.id,
        product_id: product.product_id,
        price: product.price,
        quantity: product.quantity,
      });

      ordersProductsList.push(ordersProducts);
    });

    order.order_products = ordersProductsList;

    await this.ormRepository.save(order);

    await ordersProductsRepository.save(ordersProductsList);

    return order;
  }

  public async findById(id: string): Promise<Order | undefined> {
    return this.ormRepository.findOne(id, {
      relations: ['customer', 'order_products'],
    });
  }
}

export default OrdersRepository;
