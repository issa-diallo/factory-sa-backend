export class CompanyAlreadyExistsError extends Error {
  constructor(message: string = 'Company with this name already exists.') {
    super(message);
    this.name = 'CompanyAlreadyExistsError';
  }
}
export class DomainAlreadyExistsError extends Error {
  constructor(message = 'Domain with this name already exists.') {
    super(message);
    this.name = 'DomainAlreadyExistsError';
  }
}

export class DomainNotFoundError extends Error {
  constructor(message = 'Domain not found.') {
    super(message);
    this.name = 'DomainNotFoundError';
  }
}

export class CompanyDomainNotFoundError extends Error {
  constructor(message = 'Company domain not found.') {
    super(message);
    this.name = 'CompanyDomainNotFoundError';
  }
}

export class CompanyDomainAlreadyExistsError extends Error {
  constructor(message = 'Company-domain relationship already exists.') {
    super(message);
    this.name = 'CompanyDomainAlreadyExistsError';
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Access forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}
