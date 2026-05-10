export const hianimeNotImplementedController = (endpointName) => {
  return async (c) => {
    return c.json(
      {
        success: false,
        error: `HiAnime endpoint "${endpointName}" is not implemented yet`,
        endpoint: endpointName,
      },
      501
    );
  };
};
