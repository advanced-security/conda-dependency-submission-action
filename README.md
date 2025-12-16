# Conda dependency submission action

This repository scans Conda environment.yaml files and uploads the results to the dependency graph. While GitHub does not support alerting on OS-level dependencies, it will alert on any PyPI dependencies that are defined in the environment.yaml.

## Treat all Conda packages as Python (optional)

Set `treatAsPython: true` to submit every dependency in Conda manifests as Python (PyPI) packages. This mirrors Dependabot-core Conda beta (Python-focused) behavior.

Notes:

- Names are normalized like Python packages (lowercase, `_` and `.` replaced with `-`).
- Top-level conda deps are reported as `pkg:pypi/...` when enabled.
- The `python` interpreter package is skipped.
- For wildcard/constraint/build-string specs, the purl omits the version.

### Example workflow

```yaml

name: Conda dependency submission

on:
  workflow_dispatch:
  push:

permissions: 
  id-token: write
  contents: write

jobs:
  dependency-submission:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Conda dependency scanning
        uses: advanced-security/conda-dependency-submission-action@v0.0.3
        with:
          treatAsPython: true
```

## License

This project is licensed under the terms of the MIT open source license. Please refer to [MIT](LICENSE.md) for the full terms.
