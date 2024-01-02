export function log(message?: any, ...optionalParams: any[]) {
  if (process.env.REACT_APP_DEBUG && process.env.REACT_APP_DEBUG === 'true') {
    console.log(message, ...optionalParams);
  }
}
