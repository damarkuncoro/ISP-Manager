export const getSafeErrorMessage = (err: any): string => {
  if (typeof err === 'string') return err;
  if (err && typeof err.message === 'string') return err.message;
  return JSON.stringify(err);
};

export const isSetupError = (err: any): boolean => {
  const errorCode = err?.code || '';
  const errorMessage = getSafeErrorMessage(err);

  // Check for table not found (PGRST205, 42P01) or relationship not found (PGRST200)
  return (
    errorCode === 'PGRST205' || 
    errorCode === '42P01' || 
    errorCode === 'PGRST200' ||
    errorMessage.includes('relation "tickets" does not exist') || 
    errorMessage.includes('relation "customers" does not exist') ||
    errorMessage.includes('Could not find the table') ||
    errorMessage.includes('Could not find a relationship')
  );
};