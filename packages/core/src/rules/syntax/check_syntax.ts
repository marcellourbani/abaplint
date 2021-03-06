import {IRegistry} from "../../_iregistry";
import {SyntaxLogic} from "../../abap/5_syntax/syntax";
import {BasicRuleConfig} from "../_basic_rule_config";
import {IObject} from "../../objects/_iobject";
import {ABAPObject} from "../../objects/_abap_object";
import {Issue} from "../../issue";
import {RuleTag, IRuleMetadata} from "../_irule";

export class CheckSyntaxConf extends BasicRuleConfig {
}

export class CheckSyntax {

  private conf = new CheckSyntaxConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "check_syntax",
      title: "Check syntax",
      quickfix: false,
      shortDescription: `Enables syntax check and variable resolution`,
      tags: [RuleTag.Experimental],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: CheckSyntaxConf) {
    this.conf = conf;
  }

  public run(obj: IObject, reg: IRegistry): Issue[] {
    if (!(obj instanceof ABAPObject)) {
      return [];
    }

// todo, move some of the issue building to this rule instead of the SyntaxLogic?
    return new SyntaxLogic(reg, obj).run().issues;
  }

}