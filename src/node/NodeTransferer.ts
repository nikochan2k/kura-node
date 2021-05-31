import { createReadStream, createWriteStream } from "fs";
import { get, request } from "http";
import {
  AbstractAccessor,
  FileSystemObject,
  InvalidModificationError,
  NotFoundError,
  NotReadableError,
  Transferer,
} from "kura";
import { Readable, Writable } from "stream";
import { fileURLToPath, URL } from "url";

export class NodeTransferer extends Transferer {
  constructor(private timeout = 2000) {
    super();
  }

  public async transfer(
    fromAccessor: AbstractAccessor,
    fromObj: FileSystemObject,
    toAccessor: AbstractAccessor,
    toObj: FileSystemObject
  ) {
    const fromUrl = await fromAccessor.getURL(fromObj.fullPath);
    const toUrl = await toAccessor.getURL(toObj.fullPath);
    if (fromUrl && toUrl) {
      await new Promise<void>(async (resolve, reject) => {
        let readable: Readable;
        let writable: Writable;
        if (fromUrl.startsWith("file:")) {
          const fromPath = fileURLToPath(fromUrl);
          readable = createReadStream(fromPath);
          if (toUrl.startsWith("file:")) {
            const toPath = fileURLToPath(toUrl);
            writable = createWriteStream(toPath);
          } else {
            const url = new URL(toUrl);
            writable = request({
              method: "PUT",
              href: url.href,
              timeout: this.timeout,
            });
          }
        } else {
          readable = await new Promise((resolve2, reject2) => {
            get(fromUrl, (res) => {
              resolve2(res);
            }).on("error", (e) => {
              const err = e as NodeJS.ErrnoException;
              if (err.code === "ENOENT") {
                reject2(
                  new NotFoundError(fromAccessor.name, fromObj.fullPath, e)
                );
                return;
              }
              reject2(
                new NotReadableError(fromAccessor.name, fromObj.fullPath, e)
              );
            });
          });
          if (toUrl.startsWith("file:")) {
            const toPath = fileURLToPath(toUrl);
            writable = createWriteStream(toPath);
          } else {
            const url = new URL(toUrl);
            writable = request({
              method: "PUT",
              href: url.href,
              timeout: this.timeout,
            });
          }
        }
        readable.on("error", (e) => {
          const err = e as NodeJS.ErrnoException;
          if (err.code === "ENOENT") {
            reject(new NotFoundError(fromAccessor.name, fromObj.fullPath, e));
            return;
          }
          reject(new NotReadableError(fromAccessor.name, fromObj.fullPath, e));
        });
        writable.on("finish", () => resolve());
        writable.on("error", (e) => {
          reject(
            new InvalidModificationError(toAccessor.name, toObj.fullPath, e)
          );
        });
        readable.pipe(writable);
      });
    } else {
      await super.transfer(fromAccessor, fromObj, toAccessor, toObj);
    }
  }
}
