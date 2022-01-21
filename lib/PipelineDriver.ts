import { StatefulPipelineEntity, HandlerContext } from './types';
import { Pipeline } from './Pipeline';
import { retryAround, simpleRetryPolicy, RetryPolicy } from '@sha1n/about-time';
import { createLogger } from './logger';

class PipelineDriver<T extends StatefulPipelineEntity<S>, S, C extends HandlerContext> {
  private readonly logger = createLogger(PipelineDriver.name);

  constructor(
    private readonly pipeline: Pipeline<T, S, C>,
    private readonly retryPolicy: RetryPolicy = simpleRetryPolicy(0, 0)
  ) {}

  async push(entity: T, ctx: C): Promise<T> {
    this.logger.debug('Pushing entity with state [%s]', entity.state);
    const inputState = entity.state;

    const modified = await retryAround(() => this.pipeline.handle(entity, ctx), this.retryPolicy);

    if (inputState !== modified.state) {
      this.logger.debug('Commencing... state: [%s]', modified.state);
      return this.push(modified, ctx);
    }

    return modified;
  }
}

export { PipelineDriver };
