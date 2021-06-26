import { createReadStream, createWriteStream } from "fs";
import {
  AbstractAccessor,
  FileSystemObject,
  InvalidModificationError,
  NotFoundError,
  NotReadableError,
  Transferer,
} from "kura";
import { get, put, Request } from "request";
import { Readable, Writable } from "stream";
import { fileURLToPath } from "url";

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
        let readable: Readable | Request;
        let writable: Writable | Request;
        if (fromUrl.startsWith("file:")) {
          const fromPath = fileURLToPath(fromUrl);
          readable = createReadStream(fromPath);
        } else {
          readable = get(fromUrl);
        }
        readable.on("error", (e) => {
          const err = e as NodeJS.ErrnoException;
          if (err.code === "ENOENT") {
            reject(new NotFoundError(fromAccessor.name, fromObj.fullPath, e));
            return;
          }
          reject(new NotReadableError(fromAccessor.name, fromObj.fullPath, e));
        });

        if (toUrl.startsWith("file:")) {
          const toPath = fileURLToPath(toUrl);
          writable = createWriteStream(toPath);
          writable.on("finish", () => resolve());
        } else {
          const fullPath = toObj.fullPath;
          const toUrlPut = await toAccessor.getURL(fullPath, "PUT");
          writable = put(toUrlPut, {
            headers: {
              "Content-Length": toObj.size,
            },
          });
          writable.on("response", (resp) => {
            if (resp.statusCode === 200) {
              resolve();
            }
            reject(
              new InvalidModificationError(
                toAccessor.name,
                toObj.fullPath,
                resp.statusCode + ": " + resp.statusMessage
              )
            );
          });
        }
        writable.on("error", (e) =>
          reject(
            new InvalidModificationError(toAccessor.name, toObj.fullPath, e)
          )
        );

        readable.pipe(writable);
      });
    } else {
      await super.transfer(fromAccessor, fromObj, toAccessor, toObj);
    }
  }
}
