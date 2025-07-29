import { injectable, inject } from 'tsyringe';
import { Domain, Prisma } from '../../generated/prisma';
import { IDomainRepository } from './IDomainRepository';
import { IPrismaService } from '../../database/interfaces';

@injectable()
export class PrismaDomainRepository implements IDomainRepository {
  constructor(@inject('IPrismaService') private prisma: IPrismaService) {}

  async findById(id: string): Promise<Domain | null> {
    return this.prisma.domain.findUnique({ where: { id } });
  }

  async findByDomainName(name: string): Promise<Domain | null> {
    return this.prisma.domain.findFirst({ where: { name } });
  }

  async create(data: Prisma.DomainCreateInput): Promise<Domain> {
    return this.prisma.domain.create({ data });
  }

  async update(id: string, data: Prisma.DomainUpdateInput): Promise<Domain> {
    return this.prisma.domain.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Domain> {
    return this.prisma.domain.delete({ where: { id } });
  }

  async findAll(): Promise<Domain[]> {
    return this.prisma.domain.findMany();
  }
}
