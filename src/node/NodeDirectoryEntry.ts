import {
  AbstractDirectoryEntry,
  DIR_SEPARATOR,
  DirectoryEntry,
  DirectoryEntryCallback,
  DirectoryReader,
  ErrorCallback,
  FileEntry,
  FileSystemObject,
  FileSystemParams,
  Flags,
  InvalidModificationError,
  onError,
  resolveToFullPath
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

  getDirectory(
    path: string,
    options?: Flags | undefined,
    successCallback?: DirectoryEntryCallback | undefined,
    errorCallback?: ErrorCallback | undefined
  ): void {
    path = resolveToFullPath(this.fullPath, path);

    this.getDirectoryObject(path)
      .then(obj => {
        if (!options) {
          options = {};
        }
        if (!successCallback) {
          successCallback = () => {};
        }

        if (obj) {
          if (obj.size != null) {
            onError(
              new InvalidModificationError(
                this.filesystem.name,
                path,
                `${path} is not a directory`
              ),
              errorCallback
            );
            return;
          }

          if (options.create) {
            if (options.exclusive) {
              onError(
                new InvalidModificationError(path, `${path} already exists`),
                errorCallback
              );
              return;
            }
          }
          successCallback(this.toDirectoryEntry(obj));
        } else {
          const name = path.split(DIR_SEPARATOR).pop();
          const accessor = this.params.accessor;
          const entry = new NodeDirectoryEntry({
            accessor: accessor,
            name: name,
            fullPath: path
          });
          if (accessor.useIndex) {
            accessor
              .putIndex({
                name: name,
                fullPath: path
              })
              .then(() => {
                successCallback(entry);
              })
              .catch(err => {
                onError(err, errorCallback);
              });
          } else {
            successCallback(entry);
          }
        }
      })
      .catch(err => {
        onError(err, errorCallback);
      });
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
