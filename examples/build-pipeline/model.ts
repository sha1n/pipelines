import { TimeUnit } from '@sha1n/about-time/dist/types';
import { v4 as uuid } from 'uuid';
import { StatefulPipelineEntity } from '../../lib/types';
import { Logger } from '../../lib/logger';

enum BuildState {
  Initiated = 'Build Initiated',
  WorkspaceSetup = 'Workspace Setup',
  InstallCompleted = 'Package(s) Installed',
  BuildCompleted = 'Build Complete',
  TestCompleted = 'Tests Complete',
  Completed = 'Completed',
  Failed = 'Failed',
  Cancelled = 'Cancelled'
}

class BuildTask implements StatefulPipelineEntity<BuildState> {
  readonly id: string = uuid();
  readonly dateCreated = new Date();
  dateUpdated: Date = new Date();
  state: BuildState = BuildState.Initiated;

  constructor(readonly repositoryUrl: string) {}
}

type BuildContext = {
  workspaceDir: string;
  logger: Logger;
  elapsed: (units: TimeUnit) => number;
};

export { BuildTask, BuildState, BuildContext };
