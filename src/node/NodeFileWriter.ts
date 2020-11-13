import { AbstractFileWriter, FileWriter } from "kura";
import { NodeAccessor } from "./NodeAccessor";
import { NodeFileEntry } from "./NodeFileEntry";

export class NodeFileWriter
  extends AbstractFileWriter<NodeAccessor>
  implements FileWriter {
  // #region Constructors (1)

  constructor(fileEntry: NodeFileEntry, file: File) {
    super(fileEntry, file);
  }

  // #endregion Constructors (1)
}
