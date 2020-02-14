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
  INDEX_FILE_NAME,
  InvalidModificationError,
  Permission
} from "kura";
import { normalize } from "path";
import { NodeFileSystem } from "./NodeFileSystem";

const EMPTY_BUFFER = Buffer.from("");

export async function blobToArrayBuffer(blob: Blob) {
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

function handleError(e: any) {
  const err = e as NodeJS.ErrnoException;
  if (err.code === "ENOENT") {
    return;
  }
  throw e;
}

export class NodeAccessor extends AbstractAccessor {
  filesystem: FileSystem;
  name: string;

  constructor(private rootDir: string, permission: Permission) {
    super(permission);
    this.filesystem = new NodeFileSystem(this);
    this.name = rootDir;
  }

  async doGetContent(fullPath: string): Promise<Blob> {
    try {
      const path = this.getPath(fullPath);
      const b = readFileSync(path);
      const ab = b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
      const blob = new Blob([ab]);
      return blob;
    } catch (e) {
      handleError(e);
      return null;
    }
  }

  async doGetObject(fullPath: string): Promise<FileSystemObject> {
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
      handleError(e);
      return null;
    }
  }

  async hasChild(fullPath: string) {
    const path = this.getPath(fullPath);
    try {
      const entries = readdirSync(path);
      return 0 < entries.length;
    } catch (e) {
      handleError(e);
      return false;
    }
  }

  protected async doDelete(fullPath: string, isFile: boolean) {
    const path = this.getPath(fullPath);
    try {
      if (isFile) {
        unlinkSync(path);
      } else {
        const names = readdirSync(path);
        if (names.length === 0) {
          rmdirSync(path);
        } else {
          const index = names.pop();
          if (names.length === 0 && index === INDEX_FILE_NAME) {
            return;
          }
          throw new InvalidModificationError(
            this.name,
            fullPath,
            "directory not empty"
          );
        }
      }
    } catch (e) {
      handleError(e);
    }
  }

  protected async doGetObjects(fullPath: string): Promise<FileSystemObject[]> {
    const readdirPath = this.getPath(fullPath);
    const names = readdirSync(readdirPath);
    const objects: FileSystemObject[] = [];
    for (const name of names) {
      let statPath = `${readdirPath}${DIR_SEPARATOR}${name}`;
      statPath = normalize(statPath);
      const stats = statSync(statPath);
      objects.push({
        fullPath: `${fullPath}${DIR_SEPARATOR}${name}`,
        name: name,
        lastModified: stats.mtime.getTime(),
        size: stats.isFile() ? stats.size : undefined
      });
    }
    return objects;
  }

  protected async doPutContent(fullPath: string, content: Blob) {
    const path = this.getPath(fullPath);
    const buffer = await blobToArrayBuffer(content);
    writeFileSync(path, Buffer.from(buffer));
  }

  protected async doPutObject(obj: FileSystemObject) {
    const path = this.getPath(obj.fullPath);
    if (obj.size == null) {
      mkdirSync(path);
    } else {
      writeFileSync(path, EMPTY_BUFFER);
    }
  }

  private getPath(fullPath: string) {
    let path = `${this.rootDir}${fullPath}`;
    path = normalize(path);
    return path;
  }
}
