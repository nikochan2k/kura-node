import {
  AbstractFileEntry,
  DirectoryEntry,
  FileSystemObject,
  FileSystemParams,
} from "kura";
import { NodeAccessor } from "./NodeAccessor";
import { NodeDirectoryEntry } from "./NodeDirectoryEntry";
import { NodeFileWriter } from "./NodeFileWriter";

export interface ExpoFsFileParams extends FileSystemParams<NodeAccessor> {
  size: number;
}

export class NodeFileEntry extends AbstractFileEntry<NodeAccessor> {
  constructor(params: FileSystemParams<NodeAccessor>) {
    super(params);
  }

  protected createFileWriter(file: File): NodeFileWriter {
    return new NodeFileWriter(this, file);
  }

  protected toDirectoryEntry(obj: FileSystemObject): DirectoryEntry {
    return new NodeDirectoryEntry({
      accessor: this.params.accessor,
      ...obj,
    });
  }
}
