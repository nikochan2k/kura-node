import { AbstractAccessor, AbstractLocalFileSystem } from "kura";
import { NodeAccessor } from "./NodeAccessor";

export class NodeLocalFileSystem extends AbstractLocalFileSystem {
  constructor(private rootDir: string, useIndex = false) {
    super(useIndex);
  }

  protected createAccessor(useIndex: boolean): Promise<AbstractAccessor> {
    return new Promise<NodeAccessor>(resolve => {
      const accessor = new NodeAccessor(this.rootDir, useIndex);
      resolve(accessor);
    });
  }
}
