import { Manifest } from '@github/dependency-submission-toolkit';
export default class CondaParser {
    static searchFiles(filePath?: string, filePattern?: string): string[];
    static getManifestsFromEnvironmentFiles(files: string[], options?: {
        treatAsPython?: boolean;
    }): any[];
    static getManifestFromYaml(yaml: any, filePath: string, options?: {
        treatAsPython?: boolean;
    }): Manifest;
    static buildPurl(ecosystem: string, packageName: string, version?: string): string;
    static normalizePythonName(name: string): string;
    static stripCondaChannelPrefix(dep: string): string;
    static parseCondaDependency(dep: string): {
        name: string;
        version?: string;
    };
    static parsePipDependency(dep: string): {
        name: string;
        version?: string;
    };
}
