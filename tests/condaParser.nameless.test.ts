import conda from '../src/condaParser';
import * as fs from 'fs';
import * as path from 'path';

test('Uses file basename as manifest name when YAML has no name', async () => {
  const tmpFile = path.join('tests/fixtures', 'environment-nameless.yaml');
  const content = `channels:\n- defaults\ndependencies:\n- python=3.11\n- numpy=1.26\n`;
  fs.writeFileSync(tmpFile, content, 'utf8');
  try {
    const files = conda.searchFiles('tests/fixtures', 'environment-nameless.yaml');
    const manifests = conda.getManifestsFromEnvironmentFiles(files, { treatAsPython: true });
    expect(manifests.length).toEqual(1);
    const m = JSON.parse(JSON.stringify(manifests[0]));
    expect(m.name).toEqual('environment-nameless.yaml');
    expect(m.file.source_location).toEqual('tests/fixtures/environment-nameless.yaml');
  } finally {
    fs.unlinkSync(tmpFile);
  }
});
