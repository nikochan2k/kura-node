import { NodeFileSystem } from "./NodeFileSystem";
import {
  AbstractAccessor,
  blobToArrayBuffer,
  blobToBase64,
  DIR_SEPARATOR,
  FileSystem,
  FileSystemObject
} from "kura";
import {
  readFile,
  readFileSync,
  fstat,
  stat,
  statSync,
  readdirSync,
  unlinkSync,
  writeSync,
  writeFileSync
} from "fs";
import { homedir } from "os";
import { sep } from "path";

const home = homedir();
const documentDirectory = homedir + sep + ".kura/";

export class NodeAccessor extends AbstractAccessor {
  filesystem: FileSystem;
  name: string;

  constructor(public bucket: string, useIndex: boolean) {
    super(useIndex);
    this.filesystem = new NodeFileSystem(this);
    this.name = bucket;
  }

  async getContent(fullPath: string): Promise<Blob> {
    const path = this.getPath(fullPath);
    const buffer = readFileSync(path);
    return new Blob([buffer.buffer]);
  }

  async getObject(fullPath: string): Promise<FileSystemObject> {
    const path = this.getPath(fullPath);
    try {
      const stats = statSync(path);
      return {
        fullPath: fullPath,
        name: fullPath.split(DIR_SEPARATOR).pop(),
        lastModified: stats.mtime.getTime(),
        size: stats.isFile ? stats.size : undefined
      };
    } catch (e) {
      return null;
    }
  }

  async hasChild(fullPath: string) {
    const entries = readdirSync(fullPath);
    return 0 < entries.length;
  }

  protected async doDelete(fullPath: string) {
    unlinkSync(fullPath);
  }

  protected async doGetObjects(fullPath: string): Promise<FileSystemObject[]> {
    const path = this.getPath(fullPath);
    const entries = readdirSync(path);
    const objects: FileSystemObject[] = [];
    for (const entry of entries) {
      const childPath = `${path}${sep}${entry}`;
      const stat = statSync(childPath);
      objects.push({
        fullPath: childPath,
        name: entry,
        lastModified: stat.mtime.getTime(),
        size: stat.isDirectory ? undefined : stat.size
      });
    }
    return objects;
  }

  protected async doPutContent(fullPath: string, content: Blob) {
    const path = this.getPath(fullPath);
    const buffer = blobToArrayBuffer(content);
    writeFileSync(path, buffer);
  }

  protected async doPutObject(obj: FileSystemObject) {
    const path = this.getPath(obj.fullPath);
    const buffer = new ArrayBuffer(0);
    writeFileSync(path, buffer);
  }

  private getPath(fullPath: string) {
    return `${documentDirectory}${this.bucket}${fullPath}`;
  }
}
