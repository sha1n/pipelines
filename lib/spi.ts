/**
 * A stateful persistent object that represents the state of the pipeline.
 */
interface StatefulPipelineEntity<S> {
  state: S;

  /**
   * Sets the state of the entity to the state that represents failure in this pipeline implementation.
   */
  setFailedState(): void;
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

export { StatefulPipelineEntity, StateRepository, HandlerContext, Handler };
