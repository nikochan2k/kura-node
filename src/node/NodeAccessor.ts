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
  FileSystemOptions,
  InvalidModificationError,
  NotFoundError,
  NotReadableError,
  toBuffer,
} from "kura";
import { normalize } from "path";
import { pathToFileURL } from "url";
import { NodeFileSystem } from "./NodeFileSystem";

export class NodeAccessor extends AbstractAccessor {
  // #region Properties (2)

  public filesystem: FileSystem;
  public name: string;

  // #endregion Properties (2)

  // #region Constructors (1)

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

  // #endregion Constructors (1)

  // #region Public Methods (7)

  public async doDelete(fullPath: string, isFile: boolean) {
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

  public async getURL(fullPath: string): Promise<string> {
    const path = this.getPath(fullPath);
    const url = pathToFileURL(path).toString();
    return url;
  }

  public async doGetObject(fullPath: string): Promise<FileSystemObject> {
    const path = this.getPath(fullPath);
    try {
      const stats = statSync(path);
      return {
        fullPath,
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

  public async doGetObjects(dirPath: string): Promise<FileSystemObject[]> {
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
      let statPath: string;
      if (dirPath === DIR_SEPARATOR) {
        statPath = readdirPath + name;
      } else {
        statPath = `${readdirPath}${DIR_SEPARATOR}${name}`;
      }
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
      let fullPath: string;
      if (dirPath === DIR_SEPARATOR) {
        fullPath = DIR_SEPARATOR + name;
      } else {
        fullPath = dirPath + DIR_SEPARATOR + name;
      }
      objects.push({
        fullPath: fullPath,
        name: name,
        lastModified: stats.mtime.getTime(),
        size: stats.isFile() ? stats.size : undefined,
      });
    }
    return objects;
  }

  public async doMakeDirectory(obj: FileSystemObject) {
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

  public async doReadContent(
    fullPath: string
  ): Promise<Blob | BufferSource | string> {
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

  public getPath(fullPath: string) {
    let path = `${this.rootDir}${fullPath}`;
    path = normalize(path);
    return path;
  }

  // #endregion Public Methods (7)

  // #region Protected Methods (4)

  protected async doWriteArrayBuffer(
    fullPath: string,
    arrayBuffer: ArrayBuffer
  ): Promise<void> {
    const buffer = await toBuffer(arrayBuffer);
    await this.doWriteBuffer(fullPath, buffer);
  }

  protected async doWriteBase64(
    fullPath: string,
    base64: string
  ): Promise<void> {
    const buffer = await toBuffer(base64);
    await this.doWriteBuffer(fullPath, buffer);
  }

  protected async doWriteBlob(fullPath: string, blob: Blob): Promise<void> {
    const buffer = await toBuffer(blob);
    await this.doWriteBuffer(fullPath, buffer);
  }

  protected async doWriteBuffer(fullPath: string, buffer: Buffer) {
    const path = this.getPath(fullPath);
    try {
      writeFileSync(path, buffer);
    } catch (e) {
      const err = e as NodeJS.ErrnoException;
      if (err.code === "ENOENT") {
        throw new NotFoundError(this.name, fullPath, e);
      }
      throw new InvalidModificationError(this.name, fullPath, e);
    }
  }

  // #endregion Protected Methods (4)
}
