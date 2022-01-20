import { HandlerContext } from '../..';
import { StateRepository } from '../../lib/types';

class InMemoryStateRepository<T, C extends HandlerContext> implements StateRepository<T, C> {
  entity: T;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async update(entity: T, ctx: C): Promise<T> {
    this.entity = entity;

    return entity;
  }
}

export { InMemoryStateRepository };
