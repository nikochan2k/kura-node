import { AbstractAccessor, AbstractLocalFileSystem, Permission } from "kura";
import { NodeAccessor } from "./NodeAccessor";

export class NodeLocalFileSystem extends AbstractLocalFileSystem {
  constructor(rootDir: string);
  constructor(rootDir: string, useIndex: boolean);
  constructor(rootDir: string, permission: Permission);
  constructor(private rootDir: string, config?: any) {
    super(config);
  }

  protected createAccessor(): Promise<AbstractAccessor> {
    return new Promise<NodeAccessor>(resolve => {
      const accessor = new NodeAccessor(this.rootDir, this.permission);
      resolve(accessor);
    });
  }
}
