import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import Customer from '../infra/typeorm/entities/Customer';
import ICustomersRepository from '../repositories/ICustomersRepository';

interface IRequest {
  name: string;
  email: string;
}

@injectable()
class CreateCustomerService {
  constructor(
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ name, email }: IRequest): Promise<Customer> {
    const checkCustomerExists = await this.customersRepository.findByEmail(
      email,
    );

    if (checkCustomerExists) {
      throw new AppError('This email is already in use.');
    }

    return this.customersRepository.create({ name, email });
  }
}

export default CreateCustomerService;
