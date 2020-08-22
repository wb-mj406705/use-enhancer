import { TMiddleware } from './type';

export const forward: TMiddleware = () => next => async action => {
  console.warn('Please check if your middleware forgot to handle actions.');
  await next(action);
}