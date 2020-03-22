import { mkdirSync, rmdirSync } from "fs";
import { DIR_SEPARATOR } from "kura";
import { testAll } from "kura/lib/__tests__/filesystem";
import { tmpdir } from "os";
import { normalize } from "path";
import { NodeLocalFileSystemAsync } from "../node/NodeLocalFileSystemAsync";

const tempDir = tmpdir();
let rootDir = `${tempDir}${DIR_SEPARATOR}web-file-system-index-test`;
rootDir = normalize(rootDir);

try {
  rmdirSync(rootDir, { recursive: true });
} catch {}

const factory = new NodeLocalFileSystemAsync(rootDir, { verbose: true });
testAll(factory);
