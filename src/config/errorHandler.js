export default function errorHandler(err, c) {
  console.error('Error:', err);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  return c.json(
    {
      success: false,
      error: message,
      status,
      timestamp: new Date().toISOString(),
    },
    status
  );
}
