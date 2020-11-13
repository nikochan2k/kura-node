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
  // #region Properties (1)

  private rootDir: string;

  // #endregion Properties (1)

  // #region Constructors (1)

  constructor(rootDir: string, options?: FileSystemOptions) {
    super(options);
    this.rootDir = rootDir;
  }

  // #endregion Constructors (1)

  // #region Protected Methods (1)

  protected createAccessor(): Promise<AbstractAccessor> {
    return new Promise<NodeAccessor>((resolve) => {
      const accessor = new NodeAccessor(this.rootDir, this.options);
      resolve(accessor);
    });
  }

  // #endregion Protected Methods (1)
}
