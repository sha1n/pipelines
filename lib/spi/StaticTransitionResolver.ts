import assert from 'assert';
import { NonRecoverablePipelineError } from '../errors';
import { Terminal } from './types';
import type { Handler, HandlerContext, StatefulPipelineEntity } from '../types';
import type { TransitionRecord, TransitionResolver } from './types';

class StaticTransitionResolver<T extends StatefulPipelineEntity<S>, S, C extends HandlerContext>
  implements TransitionResolver<T, S, C>
{
  private readonly mapping = new Map<S, TransitionRecord<T, S, C> | Terminal>();

  registerTransition(from: S, to: S, handler: Handler<T, C>): void {
    assert(!this.mapping.has(from), `State '${from}' already has a registered handler`);
    this.mapping.set(from, {
      handler,
      targetState: to
    });
  }

  registerTerminalState(state: S): void {
    assert(!this.mapping.has(state), `A terminal state '${state}' cannot have a registered handler`);
    this.mapping.set(state, Terminal);
  }

  resolveTransitionFrom(entity: T): TransitionRecord<T, S, C> | Terminal {
    const handler = this.mapping.get(entity.state);

    if (!handler) {
      throw new NonRecoverablePipelineError(`*** State '${entity.state}' is missing a handler. This is a bug! ***`);
    }

    return handler;
  }
}

export { StaticTransitionResolver };
