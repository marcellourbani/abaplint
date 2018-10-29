import {Statement} from "./statement";
import {verNot, str, seq, opt, plus, optPrio, IRunnable} from "../combi";
import {Field, FieldSub, Constant, Source} from "../expressions";
import {Version} from "../../version";

export class CallDialog extends Statement {

  public getMatcher(): IRunnable {
    let from = seq(new FieldSub(), optPrio(seq(str("FROM"), new Source())));
    let exporting = seq(str("EXPORTING"), plus(from));

    let to = seq(new Field(), optPrio(seq(str("TO"), new Field())));
    let importing = seq(str("IMPORTING"), plus(to));

    let ret = seq(str("CALL DIALOG"),
                  new Constant(),
                  opt(exporting),
                  opt(importing));

    return verNot(Version.Cloud, ret);
  }

}