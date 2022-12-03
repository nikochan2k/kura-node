import {
  AbstractDirectoryEntry,
  AbstractFileSystem,
  FileSystemParams,
} from "kura";
import { NodeAccessor } from "./NodeAccessor";
import { NodeDirectoryEntry } from "./NodeDirectoryEntry";

export class NodeFileSystem extends AbstractFileSystem<NodeAccessor> {
  public root: NodeDirectoryEntry;

  constructor(accessor: NodeAccessor) {
    super(accessor);
  }

  protected createRoot(
    params: FileSystemParams<NodeAccessor>
  ): AbstractDirectoryEntry<NodeAccessor> {
    return new NodeDirectoryEntry(params);
  }
}
