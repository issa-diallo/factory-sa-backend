export class CompanyAlreadyExistsError extends Error {
  constructor(message: string = 'Company with this name already exists.') {
    super(message);
    this.name = 'CompanyAlreadyExistsError';
  }
}
