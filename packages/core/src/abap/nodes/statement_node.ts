import {Position} from "../../position";
import {VirtualPosition} from "../../virtual_position";
import {AbstractNode} from "./_abstract_node";
import {INode} from "./_inode";
import {TokenNode} from "./token_node";
import {ExpressionNode} from "./expression_node";
import {Comment} from "../1_lexer/tokens/comment";
import {AbstractToken} from "../1_lexer/tokens/abstract_token";
import {Pragma} from "../1_lexer/tokens/pragma";
import {StringToken} from "../1_lexer/tokens/string";
import {StringTemplateMiddle} from "../1_lexer/tokens/string_template_middle";
import {StringTemplateEnd} from "../1_lexer/tokens/string_template_end";
import {StringTemplateBegin} from "../1_lexer/tokens/string_template_begin";
import {StringTemplate} from "../1_lexer/tokens/string_template";
import {IStatement} from "../2_statements/statements/_statement";
import {IStatementRunnable} from "../2_statements/statement_runnable";

export class StatementNode extends AbstractNode<ExpressionNode | TokenNode> {
  private readonly statement: IStatement;
  private readonly colon: AbstractToken | undefined;
  private readonly pragmas: readonly AbstractToken[];

  public constructor(statement: IStatement, colon?: AbstractToken | undefined, pragmas?: readonly AbstractToken[]) {
    super();
    this.statement = statement;
    this.colon = colon;

    if (pragmas) {
      this.pragmas = pragmas;
    } else {
      this.pragmas = [];
    }
  }

  public get() {
    return this.statement;
  }

  public getColon(): AbstractToken | undefined {
    return this.colon;
  }

  public getPragmas(): readonly AbstractToken[] {
    return this.pragmas;
  }

  public setChildren(children: (ExpressionNode | TokenNode)[]): StatementNode {
    if (children.length === 0) {
      throw new Error("statement: zero children");
    }

    this.children = children;

    return this;
  }

  public getStart(): Position {
    return this.getFirstToken().getStart();
  }

  public getEnd(): Position {
    const last = this.getLastToken();
    return last.getEnd();
  }

  public getTokens(): readonly AbstractToken[] {
    const tokens: AbstractToken[] = [];

    for (const c of this.getChildren()) {
      tokens.push(...this.toTokens(c));
    }

    return tokens;
  }

  public includesToken(search: AbstractToken): boolean {
    for (const t of this.getTokens()) {
      if (t.getStart().equals(search.getStart())) {
        return true;
      }
    }
    return false;
  }

  public getTokenNodes(): readonly TokenNode[] {
    const tokens: TokenNode[] = [];

    for (const c of this.getChildren()) {
      tokens.push(...this.toTokenNodess(c));
    }

    return tokens;
  }

  public concatTokens(): string {
    let str = "";
    let prev: AbstractToken | undefined;
    for (const token of this.getTokens()) {
      if (token instanceof Pragma) {
        continue;
      }
      if (str === "") {
        str = token.getStr();
      } else if (prev && prev.getStr().length + prev.getCol() === token.getCol()
          && prev.getRow() === token.getRow()) {
        str = str + token.getStr();
      } else {
        str = str + " " + token.getStr();
      }
      prev = token;
    }
    return str;
  }

  public concatTokensVirtual(): string {
    let str = "";
    let prev: AbstractToken | undefined;
    for (const token of this.getTokens()) {
      if (token instanceof Pragma) {
        continue;
      }
      const vprev = prev?.getStart() as VirtualPosition | undefined;
      const vtoke = token?.getStart() as VirtualPosition | undefined;
      if (str === "") {
        str = token.getStr();
      } else if (prev && vprev && vtoke
          && prev.getStr().length + vprev.vcol === vtoke.vcol
          && vprev.vrow === vtoke.vrow) {
        str = str + token.getStr();
      } else {
        str = str + " " + token.getStr();
      }
      prev = token;
    }
    return str;
  }

  public concatTokensWithoutStringsAndComments(): string {
    let str = "";
    let prev: AbstractToken | undefined;
    for (const token of this.getTokens()) {
      if (token instanceof Comment
          || token instanceof StringToken
          || token instanceof StringTemplate
          || token instanceof StringTemplateBegin
          || token instanceof StringTemplateMiddle
          || token instanceof StringTemplateEnd) {
        continue;
      }
      if (str === "") {
        str = token.getStr();
      } else if (prev && prev.getStr().length + prev.getCol() === token.getCol()
          && prev.getRow() === token.getRow()) {
        str = str + token.getStr();
      } else {
        str = str + " " + token.getStr();
      }
      prev = token;
    }
    return str;
  }

  public getTerminator(): string {
    return this.getLastToken().getStr();
  }

  public getFirstToken(): AbstractToken {
    for (const child of this.getChildren()) {
      return child.getFirstToken();
    }
    throw new Error("StatementNode, getFirstToken, no children, " + this.get().constructor.name);
  }

  public getLastToken(): AbstractToken {
    const child = this.getLastChild();

    if (child !== undefined) {
      return child.getLastToken();
    }

    throw new Error("StatementNode, getLastToken, no children");
  }

  public findDirectExpression(type: new () => IStatementRunnable): ExpressionNode | undefined {
    for (const child of this.getChildren()) {
      if (child instanceof ExpressionNode && child.get() instanceof type) {
        return child;
      }
    }
    return undefined;
  }

  public findDirectExpressions(type: new () => IStatementRunnable): readonly ExpressionNode[] {
    const ret: ExpressionNode[] = [];
    for (const child of this.getChildren()) {
      if (child instanceof ExpressionNode && child.get() instanceof type) {
        ret.push(child);
      }
    }
    return ret;
  }

  public findDirectTokenByText(text: string): AbstractToken | undefined {
    const upper = text.toUpperCase();
    for (const child of this.getChildren()) {
      if (child instanceof TokenNode && child.get().getStr().toUpperCase() === upper) {
        return child.get();
      }
    }
    return undefined;
  }

  public findFirstExpression(type: new () => IStatementRunnable): ExpressionNode | undefined {
    for (const child of this.getChildren()) {
      if (child instanceof TokenNode) {
        continue;
      } else if (child.get() instanceof type) {
        return child;
      } else {
        const res = child.findFirstExpression(type);
        if (res) {
          return res;
        }
      }
    }
    return undefined;
  }

  public findAllExpressions(type: new () => IStatementRunnable): readonly ExpressionNode[] {
    const ret: ExpressionNode[] = [];
    for (const child of this.getChildren()) {
      if (child instanceof TokenNode) {
        continue;
      } else if (child.get() instanceof type) {
        ret.push(child);
      } else {
        ret.push(...child.findAllExpressions(type));
      }
    }
    return ret;
  }

  public findAllExpressionsRecursive(type: new () => IStatementRunnable): readonly ExpressionNode[] {
    const ret: ExpressionNode[] = [];
    for (const child of this.getChildren()) {
      if (child instanceof TokenNode) {
        continue;
      } else if (child.get() instanceof type) {
        ret.push(child);
      }
      ret.push(...child.findAllExpressionsRecursive(type));
    }
    return ret;
  }

  public findAllExpressionsMulti(type: (new () => IStatementRunnable)[], recursive = false): ExpressionNode[] {
    const ret: ExpressionNode[] = [];
    for (const child of this.getChildren()) {
      if (child instanceof TokenNode) {
        continue;
      }
      const before = ret.length;
      for (const t of type) {
        if (child.get() instanceof t) {
          ret.push(child);
        }
      }
      if (before === ret.length || recursive === true) {
        ret.push(...child.findAllExpressionsMulti(type, recursive));
      }
    }
    return ret;
  }

  /**
   * Returns the Position of the first token if the sequence is found,
   * otherwise undefined. Strings and Comments are ignored in this search.
   * @param first - Text of the first Token
   * @param second - Text of the second Token
   */
  public findTokenSequencePosition(first: string, second: string): Position | undefined {
    let prev: AbstractToken | undefined;
    for (const token of this.getTokens()) {
      if (token instanceof Comment
          || token instanceof StringToken
          || token instanceof StringTemplate
          || token instanceof StringTemplateBegin
          || token instanceof StringTemplateMiddle
          || token instanceof StringTemplateEnd) {
        continue;
      }
      if (prev && token.getStr().toUpperCase() === second && prev?.getStr().toUpperCase() === first.toUpperCase()) {
        return prev.getStart();
      } else {
        prev = token;
      }
    }
    return undefined;
  }

  public findExpressionAfterToken(text: string): ExpressionNode | undefined {
    const children = this.getChildren();

    for (let i = 0; i < children.length - 1; i++) {
      const c = children[i];
      const next = children[i + 1];
      if (c instanceof TokenNode
          && c.get().getStr().toUpperCase() === text.toUpperCase()
          && next instanceof ExpressionNode) {
        return next;
      }
    }

    return undefined;
  }

  public findExpressionsAfterToken(text: string): ExpressionNode[] {
    const children = this.getChildren();
    const ret = [];

    for (let i = 0; i < children.length - 1; i++) {
      const c = children[i];
      const next = children[i + 1];
      if (c instanceof TokenNode
          && c.get().getStr().toUpperCase() === text.toUpperCase()
          && next instanceof ExpressionNode) {
        ret.push(next);
      }
    }

    return ret;
  }

////////////////////////////////

  private toTokens(b: INode): readonly AbstractToken[] {
    const tokens: AbstractToken[] = [];

    if (b instanceof TokenNode) {
      tokens.push(b.get());
      return tokens;
    }

    for (const c of b.getChildren()) {
      if (c instanceof TokenNode) {
        tokens.push(c.get());
      } else {
        tokens.push(...this.toTokens(c));
      }
    }

    return tokens;
  }

  private toTokenNodess(b: INode): readonly TokenNode[] {
    const tokens: TokenNode[] = [];

    if (b instanceof TokenNode) {
      tokens.push(b);
      return tokens;
    }

    for (const c of b.getChildren()) {
      if (c instanceof TokenNode) {
        tokens.push(c);
      } else {
        tokens.push(...this.toTokenNodess(c));
      }
    }

    return tokens;
  }
}