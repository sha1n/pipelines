import { RetryPolicy } from '@sha1n/about-time';
import { Pipeline } from './Pipeline';
import createPump from './createPump';
import { HandlerContext, StatefulPipelineEntity } from './types';

class PipelineDriver<T extends StatefulPipelineEntity<S>, S, C extends HandlerContext> {
  readonly push: (entity: T, ctx: C) => Promise<T>;

  constructor(pipeline: Pipeline<T, S, C>, retryPolicy?: RetryPolicy) {
    this.push = createPump(pipeline, retryPolicy);
  }
}

export { PipelineDriver };
