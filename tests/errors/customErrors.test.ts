import { CompanyAlreadyExistsError } from '../../src/errors/customErrors';

describe('CompanyAlreadyExistsError', () => {
  it('should create an instance with the default message', () => {
    const error = new CompanyAlreadyExistsError();
    expect(error).toBeInstanceOf(CompanyAlreadyExistsError);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('CompanyAlreadyExistsError');
    expect(error.message).toBe('Company with this name already exists.');
  });

  it('should create an instance with a custom message', () => {
    const customMessage = 'This company name is already taken.';
    const error = new CompanyAlreadyExistsError(customMessage);
    expect(error).toBeInstanceOf(CompanyAlreadyExistsError);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('CompanyAlreadyExistsError');
    expect(error.message).toBe(customMessage);
  });
});
