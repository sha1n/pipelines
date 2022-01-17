/*
 * Service provider interfaces
 */

import { HandlerContext, StateRepository } from './types';

interface TransitionHandler<T, C extends HandlerContext> {
  handle(entity: T, repository: StateRepository<T, C>, ctx: C): Promise<T>;
}

interface HandlerResolver<T, S, C extends HandlerContext> {
  resolveHandlerFor(state: S): TransitionHandler<T, C>;
}

export { HandlerResolver, TransitionHandler };
