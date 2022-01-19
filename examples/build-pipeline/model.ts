import { TimeUnit } from '@sha1n/about-time/dist/types';
import { v4 as uuid } from 'uuid';
import { StatefulPipelineEntity } from '../../lib/types';
import { Logger } from '../in-memory-repository/logger';

enum BuildState {
  Initiated,
  WorkspaceSetup,
  InstallCompleted,
  BuildCompleted,
  TestCompleted,
  Completed,
  Failed,
  Cancelled
}

class BuildTask implements StatefulPipelineEntity<BuildState> {
  readonly id: string = uuid();
  readonly dateCreated = new Date();
  dateUpdated: Date = new Date();
  state: BuildState = BuildState.Initiated;

  constructor(readonly repositoryUrl: string) {}

  setFailedState(): void {
    this.state = BuildState.Failed;
  }
}

type BuildContext = {
  workspaceDir: string;
  logger: Logger;
  elapsed: (units: TimeUnit) => number;
};

export { BuildTask, BuildState, BuildContext };
