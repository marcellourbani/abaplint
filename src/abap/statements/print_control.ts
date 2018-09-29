import {Statement} from "./statement";
import {verNot, str, alt, seq, IRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../version";

export class PrintControl extends Statement {

  public static get_matcher(): IRunnable {
    let index = seq(str("INDEX-LINE"), new Source);
    let func = seq(str("FUNCTION"), new Source);

    let ret = seq(str("PRINT-CONTROL"), alt(index, func));

    return verNot(Version.Cloud, ret);
  }

}