import * as child_process from 'child_process';

function execute(command: string, args: ReadonlyArray<string>, cwd?: string): Promise<number> {
  const p = child_process.spawn(command, [...args], {
    stdio: 'inherit',
    shell: true,
    cwd
  });

  return new Promise<number>((resolve, reject) => {
    p.on('error', reject);
    p.on('exit', resolve);
  });
}

export { execute };
