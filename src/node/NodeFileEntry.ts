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
  // #region Properties (1)

  size: number;

  // #endregion Properties (1)
}

export class NodeFileEntry extends AbstractFileEntry<NodeAccessor> {
  // #region Constructors (1)

  constructor(params: FileSystemParams<NodeAccessor>) {
    super(params);
  }

  // #endregion Constructors (1)

  // #region Protected Methods (2)

  protected createFileWriter(file: File): NodeFileWriter {
    return new NodeFileWriter(this, file);
  }

  protected toDirectoryEntry(obj: FileSystemObject): DirectoryEntry {
    return new NodeDirectoryEntry({
      accessor: this.params.accessor,
      ...obj,
    });
  }

  // #endregion Protected Methods (2)
}
