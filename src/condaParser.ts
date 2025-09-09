import * as core from '@actions/core';
import * as yaml from 'yaml';
import * as glob from 'glob';
import * as fs from 'fs';
import * as path from 'path';

import {
  PackageCache,
  BuildTarget,
  Package,
  Snapshot,
  Manifest,
  submitSnapshot
} from '@github/dependency-submission-toolkit'

export default class CondaParser {

  static searchFiles(filePath = "", filePattern = "") {
    core.debug(`Searching for files in ${filePath} with pattern ${filePattern}`);
    return glob.sync(`${filePath}/${filePattern}`, {});
  }

  static getManifestsFromEnvironmentFiles(files: string[], options?: { treatAsPython?: boolean }) {
    core.debug(`Processing ${files.length} files`);
    let manifests: any[] = [];
    files?.forEach(filePath => {
        core.debug(`Processing ${filePath}`);
        const contents = fs.readFileSync(filePath, 'utf8')
        manifests.push(CondaParser.getManifestFromYaml(yaml.parse(contents), filePath, options));
    });
    return manifests;
  }

  // Gets a Manifest object from an environment.yaml
  static getManifestFromYaml(yaml: any, filePath: string, options?: { treatAsPython?: boolean }) {
    core.debug(`getManifestFromEnvironmentFile processing ${yaml}`);

  const manifestName = yaml.name || path.basename(filePath);
  let manifest = new Manifest(manifestName, filePath);
    yaml.dependencies?.forEach((dependency: any) => {
      const treatAsPython = options?.treatAsPython === true;
      // If it's an object with the collection `pip`, then these are PyPI dependencies
      if (dependency instanceof Object && dependency.pip != null) {
        dependency.pip.forEach((pipDependency: string) => {
          const parsed = CondaParser.parsePipDependency(pipDependency);
          let name = CondaParser.normalizePythonName(parsed.name);
          let version = parsed.version;
          const ecosystem = 'pypi'; // pip deps are always PyPI
          const purl = CondaParser.buildPurl(ecosystem, name, version);
          manifest.addDirectDependency(new Package(purl));
        });
      } else if (typeof dependency === 'string') {
        // Handle top-level conda dependency (string)
        const parsed = CondaParser.parseCondaDependency(dependency);
        if (treatAsPython) {
          // Skip obvious non-PyPI package: Python interpreter
          if (parsed.name.toLowerCase() === 'python') {
            return; // skip
          }
          const name = CondaParser.normalizePythonName(parsed.name);
          const purl = CondaParser.buildPurl('pypi', name, parsed.version);
          manifest.addDirectDependency(new Package(purl));
        } else {
          const purl = CondaParser.buildPurl('conda', parsed.name, parsed.version);
          manifest.addDirectDependency(new Package(purl));
        }
      }
    });
    return manifest;
  }
  
  // Build a purl string
  static buildPurl(ecosystem: string, packageName: string, version?: string) {
    const versionSuffix = version ? `@${version}` : '';
    return `pkg:${ecosystem}/${packageName}${versionSuffix}`;
  }

  // Normalize Python package names similar to pip normalization
  static normalizePythonName(name: string) {
    return name.toLowerCase().replace(/[_.]/g, '-');
  }

  // Remove any conda channel prefix like "conda-forge::"
  static stripCondaChannelPrefix(dep: string) {
    return dep.replace(/^[^:\s]+::/, '');
  }

  // Parse a top-level conda dependency string into { name, version? }
  static parseCondaDependency(dep: string): { name: string, version?: string } {
    let s = CondaParser.stripCondaChannelPrefix(dep.trim());
    // Handle bare entries like 'pip' or 'torchvision'
    // If constraint operators or wildcards appear, don't emit a version
    const hasConstraint = /[<>~]=|>=|<=|==|!=|<|>|~=/i.test(s) || /\*/.test(s);
    // Try to capture name and exact numeric version "name=1.2.3" or fully qualified "name=1.2.3=build"
    // Prefer the first '=' as separator
    let name = s;
    let version: string | undefined = undefined;
    if (!hasConstraint) {
      // Extract on '='
      const eqIndex = s.indexOf('=');
      if (eqIndex > -1) {
        name = s.substring(0, eqIndex);
        const rest = s.substring(eqIndex + 1);
        // Version is the numeric dotted prefix of rest
        const m = rest.match(/^(\d+(?:\.\d+)*)/);
        if (m) {
          version = m[1];
        }
      } else {
        name = s;
      }
    } else {
      // If constraint like name==1.2.3 in conda section, treat as constraint; extract numeric version only when '=='
      const m2 = s.match(/^([^=!<>\s]+)==(\d+(?:\.\d+)*)$/);
      if (m2) {
        name = m2[1];
        version = m2[2];
      } else {
        const m3 = s.match(/^([^=!<>\s]+)/);
        if (m3) name = m3[1];
      }
    }
    return { name, version };
  }

  // Parse a pip dependency string "name==1.2.3"; ignore extras for purl
  static parsePipDependency(dep: string): { name: string, version?: string } {
    const s = dep.trim();
    // Remove extras in brackets
    const namePart = s.replace(/\[[^\]]*\]/g, '');
    // Extract exact version with '=='
    const m = namePart.match(/^([^=!<>\s]+)==([^\s#]+)$/);
    if (m) {
      return { name: m[1], version: m[2] };
    }
    // Otherwise, best-effort name extraction without version
    const m2 = namePart.match(/^([^=!<>\s]+)/);
    return { name: m2 ? m2[1] : namePart };
  }
}