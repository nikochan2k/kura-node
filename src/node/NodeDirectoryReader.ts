import { AbstractDirectoryReader, FileSystemObject } from "kura";
import { NodeAccessor } from "./NodeAccessor";
import { NodeDirectoryEntry } from "./NodeDirectoryEntry";
import { NodeFileEntry } from "./NodeFileEntry";

export class NodeDirectoryReader extends AbstractDirectoryReader<NodeAccessor> {
  constructor(public dirEntry: NodeDirectoryEntry) {
    super(dirEntry);
  }

  protected createEntry(obj: FileSystemObject) {
    return obj.size != null
      ? new NodeFileEntry({
          accessor: this.dirEntry.params.accessor,
          ...obj
        })
      : new NodeDirectoryEntry({
          accessor: this.dirEntry.params.accessor,
          ...obj
        });
  }
}
