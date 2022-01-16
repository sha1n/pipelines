import assert from 'assert';
import { DefaultTransitionHandler } from './DefaultTransitionHandler';
import { NoopTransitionHandler } from './NoopTransitionHandler';
import { NonRecoverablePipelineError } from './errors';
import type {
  Handler,
  HandlerContext,
  HandlerResolver,
  TransitionHandler
} from './types';

class StaticHandlerResolver<T, S, C extends HandlerContext>
  implements HandlerResolver<T, S, C>
{
  private readonly mapping = new Map<S, TransitionHandler<T, S, C>>();

  constructor(private readonly strict = true) {}

  registerTransition(from: S, to: S, handler: Handler<T, C>): void {
    assert(
      !this.mapping.has(from),
      `State '${from}' already has a registered handler`
    );
    this.mapping.set(from, new DefaultTransitionHandler<T, S, C>(handler, to));
  }

  registerDeadState(state: S): void {
    assert(
      !this.mapping.has(state),
      `A dead state '${state}' cannot have a registered handler`
    );
    this.mapping.set(state, NoopTransitionHandler);
  }

  resolveHandlerFor(state: S): TransitionHandler<T, S, C> {
    let handler = this.mapping.get(state);

    if (!handler) {
      if (this.strict) {
        throw new NonRecoverablePipelineError(
          `*** State '${state}' is missing a handler. This is a bug! ***`
        );
      }

      handler = NoopTransitionHandler;
    }

    return handler;
  }
}

export { StaticHandlerResolver };
