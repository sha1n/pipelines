import { Stateful, HandlerContext } from './types';
import { Pipeline } from './Pipeline';
import { retryAround, simpleRetryPolicy, RetryPolicy } from '@sha1n/ontime';

class PipelineDriver<T extends Stateful<S>, S, C extends HandlerContext> {
  constructor(
    private readonly pipeline: Pipeline<T, S, C>,
    private readonly retryPolicy: RetryPolicy = simpleRetryPolicy(0, 0)
  ) {}

  async push(entity: T, ctx: C): Promise<T> {
    const inputState = entity.getState();

    const modified = await retryAround(
      () => this.pipeline.handle(entity, ctx),
      this.retryPolicy
    );

    if (inputState !== modified.getState()) {
      return new Promise<T>((resolve, reject) => {
        this.push(modified, ctx).then(resolve, reject);
      });
    }

    return modified;
  }
}

export { PipelineDriver };
