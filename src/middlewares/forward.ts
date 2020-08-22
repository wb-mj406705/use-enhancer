import { TMiddleware } from './type';

export const forward: TMiddleware = () => next => async action => {
  await next(action);
}