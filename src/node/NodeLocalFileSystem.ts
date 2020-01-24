import { AbstractAccessor, AbstractLocalFileSystem } from "kura";
import { NodeAccessor } from "./NodeAccessor";

export class NodeLocalFileSystem extends AbstractLocalFileSystem {
  constructor(bucket: string, useIndex: boolean) {
    super(bucket, useIndex);
  }

  protected createAccessor(useIndex: boolean): Promise<AbstractAccessor> {
    return new Promise<NodeAccessor>(resolve => {
      const accessor = new NodeAccessor(this.bucket, useIndex);
      resolve(accessor);
    });
  }
}
