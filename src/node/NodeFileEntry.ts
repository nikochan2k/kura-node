import {
  AbstractFileEntry,
  DirectoryEntry,
  FileSystemObject,
  FileSystemParams,
} from "kura";
import { NodeAccessor } from "./NodeAccessor";
import { NodeDirectoryEntry } from "./NodeDirectoryEntry";
import { NodeFileWriter } from "./NodeFileWriter";
import { pathToFileURL } from "url";

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

  // #region Public Methods (1)

  public toURL() {
    const path = this.params.accessor.getPath(this.fullPath);
    const url = pathToFileURL(path);
    return url.toString();
  }

  // #endregion Public Methods (1)

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
