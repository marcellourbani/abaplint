import {Statement} from "./statement";
import {str, seq, alt, opt, tok, per, IRunnable} from "../combi";
import {Arrow} from "../tokens/";
import {FSTarget, Target, Source, Dynamic, Field, FieldSub} from "../expressions";

export class Assign extends Statement {

  public getMatcher(): IRunnable {
    let component = seq(str("COMPONENT"),
                        new Source(),
                        str("OF STRUCTURE"),
                        new Source());

    let tableField = seq(str("TABLE FIELD"), new Dynamic());

    let source = alt(seq(new Source(), opt(seq(tok(Arrow), new Dynamic()))),
                     component,
                     tableField,
                     seq(new Dynamic(), opt(seq(tok(Arrow), alt(new Field(), new Dynamic())))));

    let type = seq(str("TYPE"), alt(new Dynamic(), new Source()));
    let like = seq(str("LIKE"), alt(new Dynamic(), new Source()));
    let handle = seq(str("TYPE HANDLE"), new Source());
    let range = seq(str("RANGE"), new FieldSub());
    let decimals = seq(str("DECIMALS"), new Source());

    let casting = seq(opt(str("CASTING")), opt(alt(like, range, handle, per(type, decimals))));

    let ret = seq(str("ASSIGN"),
                  opt(seq(new Target(), str("INCREMENT"))),
                  source,
                  str("TO"),
                  new FSTarget(),
                  casting,
                  opt(range));

    return ret;
  }

}