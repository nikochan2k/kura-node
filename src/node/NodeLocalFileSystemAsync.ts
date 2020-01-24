import { LocalFileSystemAsync } from "kura";
import { NodeLocalFileSystem } from "./NodeLocalFileSystem";

export class NodeLocalFileSystemAsync extends LocalFileSystemAsync {
  constructor(bucket: string, useIndex?: boolean) {
    super(new NodeLocalFileSystem(bucket, useIndex));
  }
}
