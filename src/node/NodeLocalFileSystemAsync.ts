import { LocalFileSystemAsync } from "kura";
import { FileSystemOptions } from "kura/lib/FileSystemOptions";
import { NodeLocalFileSystem } from "./NodeLocalFileSystem";

export class NodeLocalFileSystemAsync extends LocalFileSystemAsync {
  constructor(rootDir: string, options?: FileSystemOptions) {
    super(new NodeLocalFileSystem(rootDir, options));
  }
}
