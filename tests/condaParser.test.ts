import conda from '../src/condaParser';

test('Gets files', async () => {
  const files = conda.searchFiles('tests/fixtures', 'environment.yaml');
  expect(files.length).toEqual(1);
});

function roundTripJSON(obj: any): object {
  return JSON.parse(JSON.stringify(obj));
}

test('Parses manifests', async () => {
  const files = conda.searchFiles('tests/fixtures', 'environment.yaml');
  const manifests = conda.getManifestsFromEnvironmentFiles(files);
  expect(manifests.length).toEqual(1);
  expect(roundTripJSON(manifests[0])).toEqual({
    resolved: {
      'pkg:conda/python@3.8': { package_url: 'pkg:conda/python@3.8', relationship: 'direct', dependencies: [] },
      'pkg:conda/pytorch@1.10': { package_url: 'pkg:conda/pytorch@1.10', relationship: 'direct', dependencies: [] },
      'pkg:conda/torchvision': { package_url: 'pkg:conda/torchvision', relationship: 'direct', dependencies: [] },
      'pkg:conda/cudatoolkit@11.0': { package_url: 'pkg:conda/cudatoolkit@11.0', relationship: 'direct', dependencies: [] },
      'pkg:conda/pip': { package_url: 'pkg:conda/pip', relationship: 'direct', dependencies: [] },
      'pkg:pypi/pytorch-lightning@1.5.2': { package_url: 'pkg:pypi/pytorch-lightning@1.5.2', relationship: 'direct', dependencies: [] },
      'pkg:pypi/einops@0.3.2': { package_url: 'pkg:pypi/einops@0.3.2', relationship: 'direct', dependencies: [] },
      'pkg:pypi/kornia@0.6.1': { package_url: 'pkg:pypi/kornia@0.6.1', relationship: 'direct', dependencies: [] },
      'pkg:pypi/opencv-python@4.5.4.58': { package_url: 'pkg:pypi/opencv-python@4.5.4.58', relationship: 'direct', dependencies: [] },
      'pkg:pypi/matplotlib@3.5.0': { package_url: 'pkg:pypi/matplotlib@3.5.0', relationship: 'direct', dependencies: [] },
      'pkg:pypi/imageio@2.10.4': { package_url: 'pkg:pypi/imageio@2.10.4', relationship: 'direct', dependencies: [] },
      'pkg:pypi/imageio-ffmpeg@0.4.5': { package_url: 'pkg:pypi/imageio-ffmpeg@0.4.5', relationship: 'direct', dependencies: [] },
      'pkg:pypi/torch-optimizer@0.3.0': { package_url: 'pkg:pypi/torch-optimizer@0.3.0', relationship: 'direct', dependencies: [] },
      'pkg:pypi/setuptools@58.2.0': { package_url: 'pkg:pypi/setuptools@58.2.0', relationship: 'direct', dependencies: [] },
      'pkg:pypi/pymcubes@0.1.2': { package_url: 'pkg:pypi/pymcubes@0.1.2', relationship: 'direct', dependencies: [] },
      'pkg:pypi/pycollada@0.7.1': { package_url: 'pkg:pypi/pycollada@0.7.1', relationship: 'direct', dependencies: [] },
      'pkg:pypi/trimesh@3.9.1': { package_url: 'pkg:pypi/trimesh@3.9.1', relationship: 'direct', dependencies: [] },
      'pkg:pypi/pyglet@1.5.10': { package_url: 'pkg:pypi/pyglet@1.5.10', relationship: 'direct', dependencies: [] },
      'pkg:pypi/networkx@2.5': { package_url: 'pkg:pypi/networkx@2.5', relationship: 'direct', dependencies: [] },
      'pkg:pypi/plyfile@0.7.2': { package_url: 'pkg:pypi/plyfile@0.7.2', relationship: 'direct', dependencies: [] },
      'pkg:pypi/open3d@0.13.0': { package_url: 'pkg:pypi/open3d@0.13.0', relationship: 'direct', dependencies: [] },
      'pkg:pypi/configargparse@1.5.3': { package_url: 'pkg:pypi/configargparse@1.5.3', relationship: 'direct', dependencies: [] },
      'pkg:pypi/ninja': { package_url: 'pkg:pypi/ninja', relationship: 'direct', dependencies: [] }
    },
    name: 'test',
    file: { source_location: 'tests/fixtures/environment.yaml' }
  });
});

test('Parses manifests with treatAsPython=true', async () => {
  const files = conda.searchFiles('tests/fixtures', 'environment.yaml');
  const manifests = conda.getManifestsFromEnvironmentFiles(files, { treatAsPython: true });
  expect(manifests.length).toEqual(1);
  const resolved = JSON.parse(JSON.stringify(manifests[0])).resolved as Record<string, any>;
  // Ensure no pkg:conda entries exist and python interpreter is skipped
  Object.keys(resolved).forEach(key => {
    expect(key.startsWith('pkg:pypi/')).toBeTruthy();
    expect(key.startsWith('pkg:pypi/python')).toBeFalsy();
  });
  // Spot check a few expected purls
  expect(resolved['pkg:pypi/pytorch@1.10']).toBeTruthy();
  expect(resolved['pkg:pypi/torchvision']).toBeTruthy();
  expect(resolved['pkg:pypi/cudatoolkit@11.0']).toBeTruthy();
  expect(resolved['pkg:pypi/pytorch-lightning@1.5.2']).toBeTruthy();
  expect(resolved['pkg:pypi/ninja']).toBeTruthy();
});