import Config from "./config";
import {MemoryFile} from "./files";
import {Version, textToVersion} from "./version";
import {Formatter} from "./formatters/_format";
import {Registry} from "./registry";
import * as Nodes from "./abap/node";

export default class Runner {
  public static version(): string {
    // magic, see build script "version.sh"
    return "{{ VERSION }}";
  }
}

// this part is required for the web things to work
exports.File = MemoryFile;
exports.Runner = Runner;
exports.Nodes = Nodes;
exports.Registry = Registry;
exports.Config = Config;
exports.Version = Version;
exports.textToVersion = textToVersion;
exports.Formatter = Formatter;