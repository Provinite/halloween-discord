import { createMockKnex } from "../../../../test/test-utils";

export const knex = jest.fn(() => createMockKnex());
export const closeKnex = jest.fn();
