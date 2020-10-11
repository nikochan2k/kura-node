import {
  mkdirSync,
  readdirSync,
  readFileSync,
  rmdirSync,
  Stats,
  statSync,
  unlinkSync,
  writeFileSync,
} from "fs";
import {
  AbstractAccessor,
  DIR_SEPARATOR,
  FileSystem,
  FileSystemObject,
  INDEX_DIR,
  INDEX_FILE_NAME,
  InvalidModificationError,
  NotFoundError,
  NotReadableError,
  toArrayBuffer,
} from "kura";
import { FileSystemOptions } from "kura/lib/FileSystemOptions";
import { normalize } from "path";
import { pathToFileURL } from "url";
import { NodeFileSystem } from "./NodeFileSystem";

export class NodeAccessor extends AbstractAccessor {
  filesystem: FileSystem;
  name: string;

  constructor(private rootDir: string, options: FileSystemOptions) {
    super(options);
    try {
      statSync(rootDir);
    } catch {
      mkdirSync(rootDir);
    }
    this.filesystem = new NodeFileSystem(this);
    this.name = rootDir;
  }

  async doDelete(fullPath: string, isFile: boolean) {
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

  async doGetObject(fullPath: string): Promise<FileSystemObject> {
    const path = this.getPath(fullPath);
    try {
      const stats = statSync(path);
      return {
        fullPath: fullPath,
        name: fullPath.split(DIR_SEPARATOR).pop(),
        lastModified: stats.mtime.getTime(),
        size: stats.isFile() ? stats.size : undefined,
      };
    } catch (e) {
      const err = e as NodeJS.ErrnoException;
      if (err.code === "ENOENT") {
        throw new NotFoundError(this.name, fullPath, e);
      }
      throw new NotReadableError(this.name, fullPath, e);
    }
  }

  async doGetObjects(dirPath: string): Promise<FileSystemObject[]> {
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
      let stats: Stats;
      try {
        stats = statSync(statPath);
      } catch (e) {
        const err = e as NodeJS.ErrnoException;
        if (err.code === "ENOENT") {
          console.warn(e);
          continue;
        } else {
          throw new NotReadableError(this.name, statPath, e);
        }
      }
      const fullPath = dirPath + DIR_SEPARATOR + name;
      objects.push({
        fullPath: fullPath,
        name: name,
        lastModified: stats.mtime.getTime(),
        size: stats.isFile() ? stats.size : undefined,
      });
    }
    return objects;
  }

  async doMakeDirectory(obj: FileSystemObject) {
    const path = this.getPath(obj.fullPath);
    try {
      mkdirSync(path);
    } catch (e) {
      try {
        statSync(path); // Already exists
        return;
      } catch {}
      throw new InvalidModificationError(this.name, obj.fullPath, e);
    }
  }

  async doReadContent(fullPath: string): Promise<Blob | ArrayBuffer | string> {
    const path = this.getPath(fullPath);
    try {
      const b = readFileSync(path);
      return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
    } catch (e) {
      const err = e as NodeJS.ErrnoException;
      if (err.code === "ENOENT") {
        throw new NotFoundError(this.name, fullPath, e);
      }
      throw new NotReadableError(this.name, fullPath, e);
    }
  }

  getPath(fullPath: string) {
    let path = `${this.rootDir}${fullPath}`;
    path = normalize(path);
    return path;
  }

  toURL(fullPath: string): string {
    const path = this.getPath(fullPath);
    const url = pathToFileURL(path);
    return url.toString();
  }

  async saveFileNameIndex(dirPath: string) {
    const indexDir = INDEX_DIR + dirPath;
    this.doMakeDirectory({
      fullPath: indexDir,
      name: INDEX_FILE_NAME,
    });
    return super.saveFileNameIndex(dirPath);
  }

  protected async doWriteArrayBuffer(
    fullPath: string,
    buffer: ArrayBuffer
  ): Promise<void> {
    const path = this.getPath(fullPath);
    try {
      writeFileSync(path, Buffer.from(buffer));
    } catch (e) {
      const err = e as NodeJS.ErrnoException;
      if (err.code === "ENOENT") {
        throw new NotFoundError(this.name, fullPath, e);
      }
      throw new InvalidModificationError(this.name, fullPath, e);
    }
  }

  protected async doWriteBase64(
    fullPath: string,
    base64: string
  ): Promise<void> {
    const buffer = await toArrayBuffer(base64);
    await this.doWriteArrayBuffer(fullPath, buffer);
  }

  protected async doWriteBlob(fullPath: string, blob: Blob): Promise<void> {
    const buffer = await toArrayBuffer(blob);
    await this.doWriteArrayBuffer(fullPath, buffer);
  }
}
