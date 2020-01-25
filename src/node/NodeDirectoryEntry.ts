import {
  AbstractDirectoryEntry,
  DirectoryEntry,
  DirectoryReader,
  FileEntry,
  FileSystemObject,
  FileSystemParams
} from "kura";
import { NodeAccessor } from "./NodeAccessor";
import { NodeDirectoryReader } from "./NodeDirectoryReader";
import { NodeFileEntry } from "./NodeFileEntry";

export class NodeDirectoryEntry extends AbstractDirectoryEntry<NodeAccessor> {
  constructor(params: FileSystemParams<NodeAccessor>) {
    super(params);
  }

  createReader(): DirectoryReader {
    return new NodeDirectoryReader(this);
  }

  toDirectoryEntry(obj: FileSystemObject): DirectoryEntry {
    return new NodeDirectoryEntry({
      accessor: this.params.accessor,
      ...obj
    });
  }

  toFileEntry(obj: FileSystemObject): FileEntry {
    return new NodeFileEntry({
      accessor: this.params.accessor,
      ...obj
    });
  }
}
