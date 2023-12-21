export function log(message?: any, ...optionalParams: any[]) {
  console.log('REACT_APP_DEBUG', process.env.REACT_APP_DEBUG);
  if (process.env.REACT_APP_DEBUG && process.env.REACT_APP_DEBUG === 'true') {
    console.log(message, ...optionalParams);
  }
}
