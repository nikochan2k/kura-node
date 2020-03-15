import {
  mkdirSync,
  readdirSync,
  readFileSync,
  rmdirSync,
  statSync,
  unlinkSync,
  writeFileSync
} from "fs";
import {
  AbstractAccessor,
  DIR_SEPARATOR,
  FileSystem,
  FileSystemObject,
  InvalidModificationError,
  normalizePath,
  NotFoundError,
  NotReadableError
} from "kura";
import { FileSystemOptions } from "kura/lib/FileSystemOptions";
import { normalize } from "path";
import { NodeFileSystem } from "./NodeFileSystem";

async function blobToArrayBuffer(blob: Blob) {
  return new Promise<ArrayBuffer>(resolve => {
    if (!blob || blob.size === 0) {
      resolve(new ArrayBuffer(0));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = function() {
      const buffer = reader.result as ArrayBuffer;
      resolve(buffer);
    };
    reader.readAsArrayBuffer(blob);
  });
}

export class NodeAccessor extends AbstractAccessor {
  filesystem: FileSystem;
  name: string;

  constructor(private rootDir: string, options: FileSystemOptions) {
    super(options);
    this.filesystem = new NodeFileSystem(this);
    this.name = rootDir;
  }

  protected async doDelete(fullPath: string, isFile: boolean) {
    const path = this.getPath(fullPath);
    try {
      if (isFile) {
        unlinkSync(path);
      } else {
        rmdirSync(path);
      }
    } catch (e) {
      const err = e as NodeJS.ErrnoException;
      if (err.code === "ENOENT") {
        throw new NotFoundError(this.name, fullPath, e);
      }
      throw new InvalidModificationError(this.name, fullPath, e);
    }
  }

  protected async doGetContent(fullPath: string): Promise<Blob> {
    const path = this.getPath(fullPath);
    try {
      const b = readFileSync(path);
      const ab = b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
      const blob = new Blob([ab]);
      return blob;
    } catch (e) {
      const err = e as NodeJS.ErrnoException;
      if (err.code === "ENOENT") {
        throw new NotFoundError(this.name, fullPath, e);
      }
      throw new NotReadableError(this.name, fullPath, e);
    }
  }

  protected async doGetObject(fullPath: string): Promise<FileSystemObject> {
    const path = this.getPath(fullPath);
    try {
      const stats = statSync(path);
      return {
        fullPath: fullPath,
        name: fullPath.split(DIR_SEPARATOR).pop(),
        lastModified: stats.mtime.getTime(),
        size: stats.isFile() ? stats.size : undefined
      };
    } catch (e) {
      const err = e as NodeJS.ErrnoException;
      if (err.code === "ENOENT") {
        throw new NotFoundError(this.name, fullPath, e);
      }
      throw new NotReadableError(this.name, fullPath, e);
    }
  }

  protected async doGetObjects(dirPath: string): Promise<FileSystemObject[]> {
    const readdirPath = this.getPath(dirPath);
    let names: string[];
    try {
      names = readdirSync(readdirPath);
    } catch (e) {
      const err = e as NodeJS.ErrnoException;
      if (err.code === "ENOENT") {
        throw new NotFoundError(this.name, dirPath, e);
      }
      throw new NotReadableError(this.name, dirPath, e);
    }
    const objects: FileSystemObject[] = [];
    for (const name of names) {
      let statPath = `${readdirPath}${DIR_SEPARATOR}${name}`;
      statPath = normalize(statPath);
      const stat = statSync(statPath);
      const fullPath = normalizePath(dirPath + DIR_SEPARATOR + name);
      objects.push({
        fullPath: fullPath,
        name: name,
        lastModified: stat.mtime.getTime(),
        size: stat.isFile() ? stat.size : undefined
      });
    }
    return objects;
  }

  protected async doPutContent(fullPath: string, content: Blob) {
    const path = this.getPath(fullPath);
    const buffer = await blobToArrayBuffer(content);
    try {
      writeFileSync(path, Buffer.from(buffer));
    } catch (e) {
      throw new InvalidModificationError(this.name, fullPath, e);
    }
  }

  protected async doPutObject(obj: FileSystemObject) {
    if (obj.size != null) {
      return;
    }

    const path = this.getPath(obj.fullPath);
    try {
      mkdirSync(path);
    } catch (e) {
      throw new InvalidModificationError(this.name, obj.fullPath, e);
    }
  }

  private getPath(fullPath: string) {
    let path = `${this.rootDir}${fullPath}`;
    path = normalize(path);
    return path;
  }
}
