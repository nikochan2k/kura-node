import {
  AbstractDirectoryEntry,
  DirectoryEntry,
  FileEntry,
  FileSystemObject,
  FileSystemParams,
} from "kura";
import { pathToFileURL } from "url";
import { NodeAccessor } from "./NodeAccessor";
import { NodeFileEntry } from "./NodeFileEntry";

export class NodeDirectoryEntry extends AbstractDirectoryEntry<NodeAccessor> {
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

  // #region Protected Methods (3)

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

  // #endregion Protected Methods (3)
}
