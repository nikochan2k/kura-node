import { AbstractAccessor, AbstractLocalFileSystem } from "kura";
import { FileSystemOptions } from "kura/lib/FileSystemOptions";
import { NodeAccessor } from "./NodeAccessor";

if (
  !(global && global.setTimeout && global.clearTimeout) &&
  !(window && window.setTimeout && window.clearTimeout)
) {
  const timers = require("timers");
  global.clearTimeout = timers.clearTimeout;
  global.setTimeout = timers.setTimeout;
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
