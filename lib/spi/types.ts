import type { Handler, HandlerContext } from '../types';

type Terminal = string;
const Terminal = 'terminal';

type TransitionRecord<T, S, C extends HandlerContext> = {
  handler: Handler<T, C>;
  targetState: S;
};

interface TransitionResolver<T, S, C extends HandlerContext> {
  resolveTransitionFrom(entity: T, ctx: C): TransitionRecord<T, S, C> | Terminal;
}

export { TransitionResolver, TransitionRecord, Terminal };
