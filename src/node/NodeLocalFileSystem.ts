import {
  AbstractAccessor,
  AbstractLocalFileSystem,
  LAST_DIR_SEPARATORS,
  Permission
} from "kura";
import { NodeAccessor } from "./NodeAccessor";

export class NodeLocalFileSystem extends AbstractLocalFileSystem {
  private rootDir: string;

  constructor(rootDir: string);
  constructor(rootDir: string, useIndex: boolean);
  constructor(rootDir: string, permission: Permission);
  constructor(rootDir: string, config?: any) {
    super(config);
    rootDir = rootDir.replace(LAST_DIR_SEPARATORS, "");
    this.rootDir = rootDir;
  }

  protected createAccessor(): Promise<AbstractAccessor> {
    return new Promise<NodeAccessor>(resolve => {
      const accessor = new NodeAccessor(this.rootDir, this.permission);
      resolve(accessor);
    });
  }
}
