import assert from 'assert';
import { DefaultTransitionHandler } from './DefaultTransitionHandler';
import { NoopTransitionHandler } from './NoopTransitionHandler';
import { NonRecoverablePipelineError } from './errors';
import type { HandlerResolver, TransitionHandler } from './spi';
import type { StatefulPipelineEntity, Handler, HandlerContext } from './types';

class StaticHandlerResolver<T extends StatefulPipelineEntity<S>, S, C extends HandlerContext>
  implements HandlerResolver<T, S, C>
{
  private readonly mapping = new Map<S, TransitionHandler<T, C>>();

  registerTransition(from: S, to: S, handler: Handler<T, C>): void {
    assert(!this.mapping.has(from), `State '${from}' already has a registered handler`);
    this.mapping.set(from, new DefaultTransitionHandler<T, S, C>(handler, to));
  }

  registerTerminalState(state: S): void {
    assert(!this.mapping.has(state), `A terminal state '${state}' cannot have a registered handler`);
    this.mapping.set(state, NoopTransitionHandler);
  }

  resolveHandlerFor(state: S): TransitionHandler<T, C> {
    const handler = this.mapping.get(state);

    if (!handler) {
      throw new NonRecoverablePipelineError(`*** State '${state}' is missing a handler. This is a bug! ***`);
    }

    return handler;
  }
}

export { StaticHandlerResolver };
