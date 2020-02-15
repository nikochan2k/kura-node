import {
  AbstractDirectoryEntry,
  DirectoryEntry,
  DirectoryReader,
  FileEntry,
  FileSystemObject,
  FileSystemParams
} from "kura";
import { pathToFileURL } from "url";
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

  toURL() {
    const path = this.params.accessor.getPath(this.fullPath);
    const url = pathToFileURL(path);
    return url.toString();
  }

  protected toDirectoryEntry(obj: FileSystemObject): DirectoryEntry {
    return new NodeDirectoryEntry({
      accessor: this.params.accessor,
      ...obj
    });
  }

  protected toFileEntry(obj: FileSystemObject): FileEntry {
    return new NodeFileEntry({
      accessor: this.params.accessor,
      ...obj
    });
  }
}
