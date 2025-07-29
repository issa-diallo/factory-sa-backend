import { Domain, Prisma } from '../../generated/prisma';

export interface IDomainRepository {
  findById(id: string): Promise<Domain | null>;
  findByDomainName(name: string): Promise<Domain | null>;
  create(data: Prisma.DomainCreateInput): Promise<Domain>;
  update(id: string, data: Prisma.DomainUpdateInput): Promise<Domain>;
  delete(id: string): Promise<Domain>;
  findAll(): Promise<Domain[]>;
}
