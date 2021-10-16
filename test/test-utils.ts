import { Knex } from "knex";

type AnyFunction = (...args: any[]) => any;
type AnyObject = Record<string | number | symbol, any>;
type AnyConstructor = new (...args: any[]) => any;

/**
 * Typecasting function for using mocked modules. Does not actually
 * mock anything.
 */

export function mocked<T extends AnyObject>(
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  obj: T,
): jest.MockedObject<{ _: T }>["_"] {
  return obj as any;
}

export type MockKnex = jest.MockedObject<
  Knex &
    Knex.QueryBuilder &
    Knex.SchemaBuilder & {
      /** Set this value to control what is returned when the knex instance is awaited */
      resolveValue: any;
      /** Set this value to something truthy to force the knex instance to reject with this value */
      rejectValue: any;
    }
>;

export function createMockKnex(): MockKnex {
  const _this: MockKnex = {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    count: jest.fn().mockReturnThis(),
    resolveValue: undefined,
    rejectValue: undefined,
    then: jest.fn<any, any>(function (res, rej) {
      if (_this.rejectValue) {
        return rej(_this.rejectValue);
      } else {
        return res(_this.resolveValue);
      }
    }),
    createTable: jest.fn().mockReturnThis(),
  } as any;
  Object.defineProperty(_this, "schema", {
    enumerable: true,
    configurable: true,
    get: () => _this,
  });

  return _this;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    /**
     * Type that mocks all keys of an object that can be mocked.
     * @see jest.MockedClass
     * @see jest.MockedFunction
     */
    export type MockedObject<T, K extends keyof T = keyof T> = {
      [key in K]: T[key] extends AnyConstructor
        ? jest.MockedClass<T[key]>
        : // Mock Classes
        T[key] extends AnyFunction
        ? jest.MockedFunction<T[key]>
        : T[key] extends AnyObject
        ? MockedObject<T[key]>
        : T[key];
    };
  }
}
