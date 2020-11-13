import { LocalFileSystemAsync } from "kura";
import { FileSystemOptions } from "kura/lib/FileSystemOptions";
import { NodeLocalFileSystem } from "./NodeLocalFileSystem";

export class NodeLocalFileSystemAsync extends LocalFileSystemAsync {
  // #region Constructors (1)

  constructor(rootDir: string, options?: FileSystemOptions) {
    super(new NodeLocalFileSystem(rootDir, options));
  }

  // #endregion Constructors (1)
}
