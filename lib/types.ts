/**
 * A stateful persistent object that represents the state of the pipeline.
 */
interface StatefulPipelineEntity<S> {
  state: S;
}

/**
 * Saves the state of a pipeline.
 */
interface StateRepository<T, C extends HandlerContext> {
  update(entity: T, ctx: C): Promise<T>;
}

/**
 * An object to be passed as context to all handlers.
 */
type HandlerContext = unknown;

/**
 * A pipeline state handler. Operates on the current entity state and returns it.
 * Although it might work just fine, a handler is not expected to modify the pipeline state, not via the entity and not by accessing a repository directly.
 */
interface Handler<T, C extends HandlerContext> {
  handle(entity: T, ctx: C): Promise<T>;
}

type OnErrorHandler<T, C extends HandlerContext> = (error: Error, entity: T, ctx: C) => Promise<T>;
type OnBeforeHandler<T, C extends HandlerContext> = (entity: T, ctx: C) => Promise<T>;
type OnAfterHandler<T, C extends HandlerContext> = (entity: T, ctx: C) => Promise<void>;

export {
  StatefulPipelineEntity,
  Handler,
  OnErrorHandler,
  OnBeforeHandler,
  OnAfterHandler,
  HandlerContext,
  StateRepository
};
