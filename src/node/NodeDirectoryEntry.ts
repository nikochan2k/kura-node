import {
  AbstractDirectoryEntry,
  DirectoryEntry,
  FileEntry,
  FileSystemObject,
  FileSystemParams,
} from "kura";
import { NodeAccessor } from "./NodeAccessor";
import { NodeFileEntry } from "./NodeFileEntry";

export class NodeDirectoryEntry extends AbstractDirectoryEntry<NodeAccessor> {
  constructor(params: FileSystemParams<NodeAccessor>) {
    super(params);
  }

  protected createEntry(obj: FileSystemObject) {
    return obj.size != null
      ? new NodeFileEntry({
          accessor: this.params.accessor,
          ...obj,
        })
      : new NodeDirectoryEntry({
          accessor: this.params.accessor,
          ...obj,
        });
  }

  protected toDirectoryEntry(obj: FileSystemObject): DirectoryEntry {
    return new NodeDirectoryEntry({
      accessor: this.params.accessor,
      ...obj,
    });
  }

  protected toFileEntry(obj: FileSystemObject): FileEntry {
    return new NodeFileEntry({
      accessor: this.params.accessor,
      ...obj,
    });
  }
}
