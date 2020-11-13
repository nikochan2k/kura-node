import {
  AbstractDirectoryEntry,
  AbstractFileSystem,
  FileSystemParams,
} from "kura";
import { NodeAccessor } from "./NodeAccessor";
import { NodeDirectoryEntry } from "./NodeDirectoryEntry";

export class NodeFileSystem extends AbstractFileSystem<NodeAccessor> {
  // #region Properties (1)

  public root: NodeDirectoryEntry;

  // #endregion Properties (1)

  // #region Constructors (1)

  constructor(accessor: NodeAccessor) {
    super(accessor);
  }

  // #endregion Constructors (1)

  // #region Protected Methods (1)

  protected createRoot(
    params: FileSystemParams<NodeAccessor>
  ): AbstractDirectoryEntry<NodeAccessor> {
    return new NodeDirectoryEntry(params);
  }

  // #endregion Protected Methods (1)
}
