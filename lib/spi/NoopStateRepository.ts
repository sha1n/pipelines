import { HandlerContext, StateRepository } from '../types';

class NoopStateRepository<T, C extends HandlerContext> implements StateRepository<T, C> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(entity: T, ctx: C): Promise<T> {
    return Promise.resolve(entity);
  }
}

export { NoopStateRepository };
