import {expect} from "chai";
import {MemoryFile} from "../../src/files";
import {Registry} from "../../src/registry";
import {Diagnostics} from "../../src/lsp/diagnostics";

describe("LSP, diagnostics", () => {

  it("find issues for file", () => {
    const file = new MemoryFile("zfoobar.prog.abap", "BREAK-POINT.");
    const registry = new Registry().addFile(file).parse();
    expect(new Diagnostics(registry).find({uri: file.getFilename()}).length).to.equal(2);
  });

  it("find issues for unknown file", () => {
    const file = new MemoryFile("zfoobar.prog.abap", "BREAK-POINT.");
    const registry = new Registry().parse();
    expect(new Diagnostics(registry).find({uri: file.getFilename()}).length).to.equal(0);
  });

  it("trigger skip logic, generated gateway class", () => {
    const file = new MemoryFile("zcl_fiori_moni_mpc.clas.abap", `
class ZCL_FIORI_MONI_MPC definition public inheriting from /IWBEP/CL_MGW_PUSH_ABS_MODELA create public.
  PUBLIC SECTION.
    METHODS moo.
ENDCLASS.
CLASS ZCL_FIORI_MONI_MPC IMPLEMENTATION.
  method moo.
    DATA bar type i.
    ADD 2 to bar.
  endmethod.
endclass.`);
    const registry = new Registry().addFile(file);
    expect(new Diagnostics(registry).find({uri: file.getFilename()}).length).to.equal(0);
  });

});