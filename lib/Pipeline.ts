import { NonRecoverablePipelineError } from './errors';
import { Terminal } from './spi/types';
import type { TransitionRecord, TransitionResolver } from './spi/types';
import type {
  HandlerContext,
  OnAfterHandler,
  OnBeforeHandler,
  OnErrorHandler,
  StatefulPipelineEntity,
  StateRepository
} from './types';

class Pipeline<T extends StatefulPipelineEntity<S>, S, C extends HandlerContext> {
  private readonly onError: OnErrorHandler<T, C>;
  private readonly onBefore: OnBeforeHandler<T, C>;
  private readonly onAfter: OnAfterHandler<T, C>;

  constructor(
    private readonly transitionResolver: TransitionResolver<T, S, C>,
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
    try {
      let modifiedEntity = await this.onBefore(entity, ctx);

      const mappingOrTerminal = this.transitionResolver.resolveTransitionFrom(entity, ctx);

      if (mappingOrTerminal !== Terminal) {
        const { targetState, handler } = mappingOrTerminal as TransitionRecord<T, S, C>;

        modifiedEntity = await handler.handle(modifiedEntity, ctx);

        modifiedEntity.state = targetState;
        modifiedEntity = await this.stateRepository.update(modifiedEntity, ctx);

        await this.onAfter(modifiedEntity, ctx);
      }

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
