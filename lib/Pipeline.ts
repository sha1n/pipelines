import { NonRecoverablePipelineError } from './errors';
import type { HandlerResolver } from './spi';
import type {
  StatefulPipelineEntity,
  HandlerContext,
  OnAfterHandler,
  OnBeforeHandler,
  OnErrorHandler,
  StateRepository
} from './types';

class Pipeline<T extends StatefulPipelineEntity<S>, S, C extends HandlerContext> {
  private readonly onError: OnErrorHandler<T, C>;
  private readonly onBefore: OnBeforeHandler<T, C>;
  private readonly onAfter: OnAfterHandler<T, C>;

  constructor(
    private readonly handlerResolver: HandlerResolver<T, S, C>,
    private readonly stateRepository: StateRepository<T, C>,
    onError?: OnErrorHandler<T, C>,
    onBefore?: OnBeforeHandler<T, C>,
    onAfter?: OnAfterHandler<T, C>
  ) {
    this.onError = onError || this.getDefaultErrorHandler();
    this.onBefore = onBefore || ((entity: T) => Promise.resolve(entity));
    this.onAfter = onAfter || (() => Promise.resolve());
  }

  async handle(entity: T, ctx: C): Promise<T> {
    const handler = this.handlerResolver.resolveHandlerFor(entity.state);

    try {
      const maybeModified = await this.onBefore(entity, ctx);
      const modifiedEntity = await handler.handle(maybeModified, this.stateRepository, ctx);
      await this.onAfter(modifiedEntity, ctx);

      return modifiedEntity;
    } catch (e) {
      return this.onError(e, entity, ctx);
    }
  }

  private readonly getDefaultErrorHandler = () => {
    return (error: Error, entity: T, ctx: C) => {
      if (error instanceof NonRecoverablePipelineError) {
        entity.setFailedState();
        return this.stateRepository.update(entity, ctx);
      } else {
        throw error;
      }
    };
  };
}

export { Pipeline };
