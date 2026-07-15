import { ObjectLiteral, Repository } from 'typeorm';

export type MockRepository<T extends ObjectLiteral> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

export const mockRepository = <
  T extends ObjectLiteral,
>(): MockRepository<T> => ({
  findOne: jest.fn(),
  find: jest.fn(),
  exists: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});
