import * as Statements from "./statements";
import * as Expressions from "./expressions";
import * as Structures from "./structures";
import {Structure} from "./structures/_structure";
import {Combi, Expression} from "./combi";
import {Statement} from "./statements/_statement";

export interface IKeyword {
  word: string;
  source: string[];
}

class List {
  private words: IKeyword[];

  public constructor() {
    this.words = [];
  }

  public add(keywords: string[], source: string): void {
    for (let w of keywords) {
      let index = this.find(w);
      if (index >= 0) {
        this.words[index].source.push(source);
      } else {
        this.words.push({word: w, source: [source]});
      }
    }
  }

  public get(): IKeyword[] {
    return this.words;
  }

  private find(keyword: string): number {
    for (let i = 0; i < this.words.length; i++) {
      if (this.words[i].word === keyword) {
        return i;
      }
    }
    return -1;
  }
}

function className(cla: any) {
  return (cla.constructor + "").match(/\w+/g)[1];
}

export class Artifacts {

  public static getStructures(): Structure[] {
    let ret: Structure[] = [];

    for (let key in Structures) {
      const list: any = Structures;
      if (typeof list[key] === "function") {
        ret.push(new list[key]());
      }
    }

    return ret;
  }

  public static getExpressions(): Expression[] {
    let ret: Expression[] = [];

    for (let key in Expressions) {
      const list: any = Expressions;
      if (typeof list[key] === "function") {
        ret.push(new list[key]());
      }
    }

    return ret;
  }

  public static getStatements(): Statement[] {
    let ret: Statement[] = [];

    for (let key in Statements) {
      const list: any = Statements;
      if (typeof list[key] === "function") {
        ret.push(new list[key]());
      }
    }

    return ret;
  }

  public static newStatement(name: string): Statement {
    const list: any = Statements;
    return new list[name]();
  }

  public static getKeywords(): IKeyword[] {
    let list: List = new List();

    for (let stat of this.getStatements()) {
      list.add(Combi.listKeywords(stat.getMatcher()), "statement_" + className(stat));
    }

    for (let expr of this.getExpressions()) {
      list.add(Combi.listKeywords(expr.getRunnable()), "expression_" + className(expr));
    }

    return list.get();
  }

}