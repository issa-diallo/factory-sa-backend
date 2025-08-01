export class NoRoleInCompanyError extends Error {
  constructor() {
    super('User has no role in this company');
    this.name = 'NoRoleInCompanyError';
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid credentials');
    this.name = 'InvalidCredentialsError';
  }
}

export class UserNotFoundError extends Error {
  constructor() {
    super('User not found');
    this.name = 'UserNotFoundError';
  }
}

export class CompanyNotFoundError extends Error {
  constructor() {
    super('Company not found');
    this.name = 'CompanyNotFoundError';
  }
}

export class UserNotActiveError extends Error {
  constructor() {
    super('User is not active');
    this.name = 'UserNotActiveError';
  }
}

export class DomainNotActiveError extends Error {
  constructor() {
    super('Domain is not active');
    this.name = 'DomainNotActiveError';
  }
}
