export const animekaiNotImplementedController = (endpointName) => {
  return async (c) => {
    return c.json(
      {
        success: false,
        error: `AnimeKai endpoint "${endpointName}" is not implemented yet`,
        endpoint: endpointName,
      },
      501
    );
  };
};
