import { HandlerContext, StateRepository } from './spi';

interface TransitionHandler<T, C extends HandlerContext> {
  handle(entity: T, repository: StateRepository<T, C>, ctx: C): Promise<T>;
}

interface HandlerResolver<T, S, C extends HandlerContext> {
  resolveHandlerFor(state: S): TransitionHandler<T, C>;
}

type OnErrorHandler<T, C extends HandlerContext> = (error: Error, entity: T, ctx: C) => Promise<T>;
type OnBeforeHandler<T, C extends HandlerContext> = (entity: T, ctx: C) => Promise<T>;
type OnAfterHandler<T, C extends HandlerContext> = (entity: T, ctx: C) => Promise<void>;

export {
  TransitionHandler,
  OnErrorHandler,
  OnBeforeHandler,
  OnAfterHandler,
  HandlerContext,
  StateRepository,
  HandlerResolver
};
