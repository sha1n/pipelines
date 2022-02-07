import { exponentialBackoffRetryPolicy, retryAround, stopwatch } from '@sha1n/about-time';
import os from 'os';
import path from 'path';
import createPump from '../..';
import { createLogger } from '../../lib/logger';
import { BuildContext, BuildTask } from './model';
import pipeline from './pipeline';
import { execute } from './shell';

const pump = createPump(pipeline);
const task = new BuildTask('git@github.com:sha1n/fungus.git');
const wsBasePath = path.join(os.tmpdir(), 'build-pipelines');
const ctx = <BuildContext>{
  workspaceDir: path.join(wsBasePath, task.id),
  elapsed: stopwatch(),
  logger: createLogger(`BuildTask:${task.id}`)
};

execute('mkdir', ['-p', wsBasePath])
  .then(() => {
    return pump(task, ctx);
  })
  .finally(() => {
    return retryAround(() => execute('rm', ['-rf', wsBasePath]), exponentialBackoffRetryPolicy(2));
  });
