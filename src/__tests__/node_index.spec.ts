import { mkdirSync, rmdirSync } from "fs";
import { DIR_SEPARATOR, testAll } from "kura";
import { tmpdir } from "os";
import { normalize } from "path";
import { NodeLocalFileSystemAsync } from "../node/NodeLocalFileSystemAsync";

const tempDir = tmpdir();
let rootDir = `${tempDir}${DIR_SEPARATOR}web-file-system-index-test`;
rootDir = normalize(rootDir);

try {
  rmdirSync(rootDir, { recursive: true });
} catch (e) {}
try {
  mkdirSync(rootDir, { recursive: true });
} catch (e) {}

const factory = new NodeLocalFileSystemAsync(rootDir, {
  useIndex: true,
  verbose: true
});
testAll(factory);
