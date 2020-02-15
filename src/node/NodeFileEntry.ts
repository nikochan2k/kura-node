import {
  AbstractFileEntry,
  DirectoryEntry,
  FileSystemObject,
  FileSystemParams
} from "kura";
import { NodeAccessor } from "./NodeAccessor";
import { NodeDirectoryEntry } from "./NodeDirectoryEntry";
import { NodeFileWriter } from "./NodeFileWriter";
import { pathToFileURL } from "url";

export interface ExpoFsFileParams extends FileSystemParams<NodeAccessor> {
  size: number;
}

export class NodeFileEntry extends AbstractFileEntry<NodeAccessor> {
  constructor(params: FileSystemParams<NodeAccessor>) {
    super(params);
  }

  toURL() {
    const path = this.params.accessor.getPath(this.fullPath);
    const url = pathToFileURL(path);
    return url.toString();
  }

  protected createFileWriter(file: File): NodeFileWriter {
    return new NodeFileWriter(this, file);
  }

  protected toDirectoryEntry(obj: FileSystemObject): DirectoryEntry {
    return new NodeDirectoryEntry({
      accessor: this.params.accessor,
      ...obj
    });
  }
}
