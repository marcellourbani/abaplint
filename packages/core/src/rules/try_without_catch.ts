import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {IRegistry} from "../_iregistry";
import {Try, Catch} from "../abap/3_structures/structures";
import {BasicRuleConfig} from "./_basic_rule_config";

export class TryWithoutCatchConf extends BasicRuleConfig {
}

export class TryWithoutCatch extends ABAPRule {
  private conf = new TryWithoutCatchConf();

  public getMetadata() {
    return {
      key: "try_without_catch",
      title: "TRY without CATCH",
      quickfix: false,
      shortDescription: `Checks for TRY blocks without a CATCH block`,
    };
  }

  private getMessage(): string {
    return "A TRY block must have a corresponding CATCH block.";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: TryWithoutCatchConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, _reg: IRegistry) {
    const issues: Issue[] = [];

    const stru = file.getStructure();
    if (stru === undefined) {
      return [];
    }

    const tries = stru.findAllStructures(Try);

    for (const t of tries) {
      const c = t.findFirstStructure(Catch);
      if (c === undefined) {
        const issue = Issue.atToken(file, t.getFirstToken(), this.getMessage(), this.getMetadata().key);
        issues.push(issue);
      }
    }

    return issues;
  }
}