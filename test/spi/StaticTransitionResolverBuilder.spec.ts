import { createTransitionResolverBuilder } from '../../lib/spi/StaticTransitionResolverBuilder';
import { Terminal } from '../../lib/spi/types';
import { MyEntity, MyState } from '../examples';
import { aMockHandler } from '../mocks';
import type { TransitionRecord } from '../../lib/spi/types';
import type { HandlerContext } from '../../lib/types';

describe('StaticTransitionResolverBuilder', () => {
  test('should build', () => {
    const resolver = createTransitionResolverBuilder()
      .withTransition(MyState.A, MyState.Completed, aMockHandler())
      .withTerminalStates(MyState.Failed, MyState.Completed)
      .build();
    const entity = new MyEntity(MyState.A);

    const handler = resolver.resolveTransitionFrom(entity) as TransitionRecord<MyEntity, MyState, HandlerContext>;
    expect(handler.targetState).toEqual(MyState.Completed);
    expect(resolver.resolveTransitionFrom(new MyEntity(MyState.Failed))).toEqual(Terminal);
    expect(resolver.resolveTransitionFrom(new MyEntity(MyState.Completed))).toEqual(Terminal);
  });
});
