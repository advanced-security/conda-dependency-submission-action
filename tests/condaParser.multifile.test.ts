import conda from '../src/condaParser';

function asJSON(obj: any): any {
  return JSON.parse(JSON.stringify(obj));
}

test('Globs both environment.yaml and environment.yml by default pattern', async () => {
  const filesYaml = conda.searchFiles('tests/fixtures', 'environment.yaml');
  const filesYml = conda.searchFiles('tests/fixtures', 'environment.yml');
  expect(filesYaml.length).toEqual(1);
  expect(filesYml.length).toEqual(1);
});

test('Brace pattern finds both manifests', async () => {
  const files = conda.searchFiles('tests/fixtures', 'environment.{yaml,yml}');
  expect(files.length).toEqual(2);
});

test('Parses both manifests in default mode', async () => {
  const files = [
    ...conda.searchFiles('tests/fixtures', 'environment.yaml'),
    ...conda.searchFiles('tests/fixtures', 'environment.yml')
  ];
  const manifests = conda.getManifestsFromEnvironmentFiles(files);
  expect(manifests.length).toEqual(2);
  const m0 = asJSON(manifests[0]);
  const m1 = asJSON(manifests[1]);
  // Ensure each manifest has a resolved map with some expected entries
  expect(m0.resolved['pkg:conda/python@3.8']).toBeTruthy();
  expect(m1.resolved['pkg:conda/python@3.9']).toBeTruthy();
});

test('Parses both manifests with treatAsPython=true', async () => {
  const files = [
    ...conda.searchFiles('tests/fixtures', 'environment.yaml'),
    ...conda.searchFiles('tests/fixtures', 'environment.yml')
  ];
  const manifests = conda.getManifestsFromEnvironmentFiles(files, { treatAsPython: true });
  expect(manifests.length).toEqual(2);
  const m0 = asJSON(manifests[0]);
  const m1 = asJSON(manifests[1]);
  // No conda purls, python interpreter skipped
  Object.keys(m0.resolved).forEach(k => {
    expect(k.startsWith('pkg:pypi/')).toBeTruthy();
    expect(k.startsWith('pkg:pypi/python')).toBeFalsy();
  });
  Object.keys(m1.resolved).forEach(k => {
    expect(k.startsWith('pkg:pypi/')).toBeTruthy();
    expect(k.startsWith('pkg:pypi/python')).toBeFalsy();
  });
});
