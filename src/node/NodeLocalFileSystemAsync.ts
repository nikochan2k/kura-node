import { LocalFileSystemAsync, Permission } from "kura";
import { NodeLocalFileSystem } from "./NodeLocalFileSystem";

export class NodeLocalFileSystemAsync extends LocalFileSystemAsync {
  constructor(rootDir: string);
  constructor(rootDir: string, useIndex: boolean);
  constructor(rootDir: string, permission: Permission);
  constructor(rootDir: string, config?: any) {
    super(new NodeLocalFileSystem(rootDir, config));
  }
}
