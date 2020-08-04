export type StubDataClient = {
  findAllTrainingResults: jest.Mock;
  search: jest.Mock;
  findTrainingResultsByIds: jest.Mock;
  findTrainingById: jest.Mock;
};

export const StubDataClient = (): StubDataClient => ({
  findAllTrainingResults: jest.fn(),
  search: jest.fn(),
  findTrainingResultsByIds: jest.fn(),
  findTrainingById: jest.fn(),
});
