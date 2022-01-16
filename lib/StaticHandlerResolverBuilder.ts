import { StaticHandlerResolver } from './StaticHandlerResolver';
import type { HandlerContext, Handler } from './types';

class StaticHandlerResolverBuilder<T, S, C extends HandlerContext> {
  private readonly resolver: StaticHandlerResolver<T, S, C>;

  constructor(strict?: boolean) {
    this.resolver = new StaticHandlerResolver<T, S, C>(strict);
  }

  withTransition(
    from: S,
    to: S,
    through: Handler<T, C>
  ): StaticHandlerResolverBuilder<T, S, C> {
    this.resolver.registerTransition(from, to, through);
    return this;
  }

  withDeadStates(...state: S[]): StaticHandlerResolverBuilder<T, S, C> {
    state.forEach((s) => {
      this.resolver.registerDeadState(s);
    });
    return this;
  }

  build(): StaticHandlerResolver<T, S, C> {
    return this.resolver;
  }
}

function createStaticHandlerResolver<T, S, C extends HandlerContext>(
  strict?: boolean
): StaticHandlerResolverBuilder<T, S, C> {
  return new StaticHandlerResolverBuilder(strict);
}

export { createStaticHandlerResolver };
