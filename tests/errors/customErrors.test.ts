import {
  CompanyAlreadyExistsError,
  DomainAlreadyExistsError,
  DomainNotFoundError,
  CompanyDomainNotFoundError,
  CompanyDomainAlreadyExistsError,
} from '../../src/errors/customErrors';

describe('Custom Error Classes', () => {
  describe('CompanyAlreadyExistsError', () => {
    it('should create an instance with the default message', () => {
      const error = new CompanyAlreadyExistsError();
      expect(error).toBeInstanceOf(CompanyAlreadyExistsError);
      expect(error.name).toBe('CompanyAlreadyExistsError');
      expect(error.message).toBe('Company with this name already exists.');
    });

    it('should create an instance with a custom message', () => {
      const msg = 'Custom company exists message';
      const error = new CompanyAlreadyExistsError(msg);
      expect(error.message).toBe(msg);
    });
  });

  describe('DomainAlreadyExistsError', () => {
    it('should create an instance with the default message', () => {
      const error = new DomainAlreadyExistsError();
      expect(error).toBeInstanceOf(DomainAlreadyExistsError);
      expect(error.name).toBe('DomainAlreadyExistsError');
      expect(error.message).toBe('Domain with this name already exists.');
    });

    it('should create an instance with a custom message', () => {
      const msg = 'Custom domain exists message';
      const error = new DomainAlreadyExistsError(msg);
      expect(error.message).toBe(msg);
    });
  });

  describe('DomainNotFoundError', () => {
    it('should create an instance with the default message', () => {
      const error = new DomainNotFoundError();
      expect(error).toBeInstanceOf(DomainNotFoundError);
      expect(error.name).toBe('DomainNotFoundError');
      expect(error.message).toBe('Domain not found.');
    });

    it('should create an instance with a custom message', () => {
      const msg = 'Domain not found with ID xyz';
      const error = new DomainNotFoundError(msg);
      expect(error.message).toBe(msg);
    });
  });

  describe('CompanyDomainNotFoundError', () => {
    it('should create an instance with the default message', () => {
      const error = new CompanyDomainNotFoundError();
      expect(error).toBeInstanceOf(CompanyDomainNotFoundError);
      expect(error.name).toBe('CompanyDomainNotFoundError');
      expect(error.message).toBe('Company domain not found.');
    });

    it('should create an instance with a custom message', () => {
      const msg = 'No company-domain relation found';
      const error = new CompanyDomainNotFoundError(msg);
      expect(error.message).toBe(msg);
    });
  });

  describe('CompanyDomainAlreadyExistsError', () => {
    it('should create an instance with the default message', () => {
      const error = new CompanyDomainAlreadyExistsError();
      expect(error).toBeInstanceOf(CompanyDomainAlreadyExistsError);
      expect(error.name).toBe('CompanyDomainAlreadyExistsError');
      expect(error.message).toBe('Company-domain relationship already exists.');
    });

    it('should create an instance with a custom message', () => {
      const msg = 'Custom company-domain exists message';
      const error = new CompanyDomainAlreadyExistsError(msg);
      expect(error.message).toBe(msg);
    });
  });
});
