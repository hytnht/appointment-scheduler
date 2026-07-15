import { ObjectLiteral, Repository } from 'typeorm';

type ArgsType<T> = T extends (...args: infer A) => unknown ? A : never;
export type TMockRepository<T extends ObjectLiteral> = {
  [P in keyof T]: T[P] extends (...args: any) => unknown
    ? jest.Mock<ReturnType<T[P]>, ArgsType<T[P]>>
    : never;
};

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
