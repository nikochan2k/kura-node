import { createReadStream, createWriteStream } from "fs";
import * as http from "http";
import * as https from "https";
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
  constructor(private timeout = 1000) {
    super();
  }

  public async transfer(
    fromAccessor: AbstractAccessor,
    fromObj: FileSystemObject,
    toAccessor: AbstractAccessor,
    toObj: FileSystemObject
  ) {
    const fromUrl = await fromAccessor.getURL(fromObj.fullPath, "GET");
    const toUrl = await toAccessor.getURL(toObj.fullPath, "GET");
    if (fromUrl && toUrl) {
      await new Promise<void>(async (resolve, reject) => {
        const open = async () => {
          const toUrlPut = await toAccessor.getURL(toObj.fullPath, "PUT");
          const url = new URL(toUrlPut);
          const request =
            url.protocol === "https" ? https.request : http.request;
          return request(
            {
              protocol: url.protocol,
              hostname: url.hostname,
              port: url.port,
              pathname: url.pathname,
              search: url.search,
              method: "PUT",
              timeout: this.timeout,
            },
            (res) => {
              if (res.statusCode === 200) {
                resolve();
              } else {
                reject(
                  new InvalidModificationError(
                    toAccessor.name,
                    toObj.fullPath,
                    res.statusCode + ": " + res.statusMessage
                  )
                );
              }
            }
          );
        };

        let readable: Readable;
        let writable: Writable;
        if (fromUrl.startsWith("file:")) {
          const fromPath = fileURLToPath(fromUrl);
          readable = createReadStream(fromPath);
          if (toUrl.startsWith("file:")) {
            const toPath = fileURLToPath(toUrl);
            writable = createWriteStream(toPath);
            writable.on("finish", () => resolve());
          } else {
            writable = await open();
          }
        } else {
          try {
            const url = new URL(fromUrl);
            const get = url.protocol === "https" ? https.get : http.get;
            readable = await new Promise((resolve2, reject2) => {
              get(fromUrl, (res) => {
                if (res.statusCode === 200) {
                  resolve2(res);
                } else if (res.statusCode === 404) {
                  reject2(
                    new NotFoundError(fromAccessor.name, fromObj.fullPath)
                  );
                } else {
                  reject2(
                    new NotReadableError(
                      fromAccessor.name,
                      fromObj.fullPath,
                      res.statusCode + ": " + res.statusMessage
                    )
                  );
                }
              }).on("error", (e) => {
                reject2(
                  new NotReadableError(fromAccessor.name, fromObj.fullPath, e)
                );
              });
            });
          } catch (e) {
            reject(e);
          }
          if (toUrl.startsWith("file:")) {
            const toPath = fileURLToPath(toUrl);
            writable = createWriteStream(toPath);
            writable.on("finish", () => resolve());
          } else {
            writable = await open();
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
