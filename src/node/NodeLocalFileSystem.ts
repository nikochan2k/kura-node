import { AbstractAccessor, AbstractLocalFileSystem } from "kura";
import { FileSystemOptions } from "kura/lib/FileSystemOptions";
import { NodeAccessor } from "./NodeAccessor";

const globalVar =
  typeof window !== "undefined"
    ? window
    : typeof global !== "undefined"
    ? global
    : Function("return this;")();

if (!globalVar.setTimeout || !globalVar.clearTimeout) {
  const timers = require("timers");
  globalVar.clearTimeout = timers.clearTimeout;
  globalVar.setTimeout = timers.setTimeout;
}

export class NodeLocalFileSystem extends AbstractLocalFileSystem {
  private rootDir: string;

  constructor(rootDir: string, options?: FileSystemOptions) {
    super(options);
    this.rootDir = rootDir;
  }

  protected createAccessor(): Promise<AbstractAccessor> {
    return new Promise<NodeAccessor>((resolve) => {
      const accessor = new NodeAccessor(this.rootDir, this.options);
      resolve(accessor);
    });
  }
}
