import type { StatefulPipelineEntity, Handler, HandlerContext } from './spi';
import type { StateRepository, TransitionHandler } from './types';

class DefaultTransitionHandler<T extends StatefulPipelineEntity<S>, S, C extends HandlerContext>
  implements TransitionHandler<T, C>
{
  constructor(private readonly currentStatusHandler: Handler<T, C>, readonly targetState: S) {}

  async handle(entity: T, repository: StateRepository<T, C>, ctx: C): Promise<T> {
    let maybeModified = await this.currentStatusHandler.handle(entity, ctx);
    maybeModified.state = this.targetState;
    maybeModified = await repository.update(maybeModified, ctx);

    return maybeModified;
  }
}

export { DefaultTransitionHandler };
