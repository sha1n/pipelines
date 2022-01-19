import { StaticTransitionResolver } from './StaticTransitionResolver';
import type { StatefulPipelineEntity, Handler, HandlerContext } from '../types';

class StaticTransitionResolverBuilder<T extends StatefulPipelineEntity<S>, S, C extends HandlerContext> {
  private readonly resolver = new StaticTransitionResolver<T, S, C>();

  withTransition(from: S, to: S, through: Handler<T, C>): StaticTransitionResolverBuilder<T, S, C> {
    this.resolver.registerTransition(from, to, through);
    return this;
  }

  withPassthrough(from: S, to: S): StaticTransitionResolverBuilder<T, S, C> {
    this.resolver.registerTransition(from, to, {
      handle(entity) {
        return Promise.resolve(entity);
      }
    });
    return this;
  }

  withTerminalStates(...state: S[]): StaticTransitionResolverBuilder<T, S, C> {
    state.forEach(s => {
      this.resolver.registerTerminalState(s);
    });
    return this;
  }

  build(): StaticTransitionResolver<T, S, C> {
    return this.resolver;
  }
}

function createTransitionResolverBuilder<
  T extends StatefulPipelineEntity<S>,
  S,
  C extends HandlerContext
>(): StaticTransitionResolverBuilder<T, S, C> {
  return new StaticTransitionResolverBuilder();
}

export { createTransitionResolverBuilder };
