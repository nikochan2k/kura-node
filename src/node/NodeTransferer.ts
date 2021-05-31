import { createReadStream, createWriteStream } from "fs";
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
import { get, request } from "http";

export class NodeTransferer extends Transferer {
  constructor(
    fromAccessor: AbstractAccessor,
    toAccessor: AbstractAccessor,
    private timeout = 2000
  ) {
    super(fromAccessor, toAccessor);
  }

  public async transfer(fromObj: FileSystemObject, toObj: FileSystemObject) {
    const fromUrl = fromObj.url;
    const toUrl = toObj.url;
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
                  new NotFoundError(this.fromAccessor.name, fromObj.fullPath, e)
                );
                return;
              }
              reject2(
                new NotReadableError(
                  this.fromAccessor.name,
                  fromObj.fullPath,
                  e
                )
              );
            });
          });
          if (toUrl.startsWith("file")) {
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
            reject(
              new NotFoundError(this.fromAccessor.name, fromObj.fullPath, e)
            );
            return;
          }
          reject(
            new NotReadableError(this.fromAccessor.name, fromObj.fullPath, e)
          );
        });
        writable.on("finish", () => resolve());
        writable.on("error", (e) => {
          reject(
            new InvalidModificationError(
              this.toAccessor.name,
              toObj.fullPath,
              e
            )
          );
        });
        readable.pipe(writable);
      });
    } else {
      await super.transfer(fromObj, toObj);
    }
  }
}
