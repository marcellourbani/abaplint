import * as Statements from "../2_statements/statements";
import * as Expressions from "../2_statements/expressions";
import * as Tokens from "../1_lexer/tokens";
import {Identifier} from "./_identifier";
import {StructureNode, StatementNode, ExpressionNode} from "../../abap/nodes";
import {Expression} from "../2_statements/combi";
import {TypedIdentifier} from "./_typed_identifier";
import {CurrentScope} from "../5_syntax/_current_scope";
import {FormParam} from "../5_syntax/expressions/form_param";
import {IFormDefinition} from "./_form_definition";

export class FormDefinition extends Identifier implements IFormDefinition {
  private readonly node: StatementNode;
  private readonly parameters: TypedIdentifier[];
  private readonly tableParameters: TypedIdentifier[];
  private readonly usingParameters: TypedIdentifier[];
  private readonly changingParameters: TypedIdentifier[];

  public constructor(node: StructureNode | StatementNode, filename: string, scope: CurrentScope) {
    const st = node instanceof StructureNode ? node.findFirstStatement(Statements.Form)! : node;

    // FORMs can contain a dash in the name
    const pos = st.findFirstExpression(Expressions.FormName)!.getFirstToken().getStart();
    const name = st.findFirstExpression(Expressions.FormName)!.concatTokens();
    const nameToken = new Tokens.Identifier(pos, name);

    super(nameToken, filename);
    this.node = st;

    this.parameters = this.findParams(this.node, scope);
    this.tableParameters = this.findType(Expressions.FormTables, scope);
    this.usingParameters = this.findType(Expressions.FormUsing, scope);
    this.changingParameters = this.findType(Expressions.FormChanging, scope);
  }

  public getParameters(): TypedIdentifier[] {
    return this.parameters;
  }

  public getTablesParameters(): TypedIdentifier[] {
    return this.tableParameters;
  }

  public getUsingParameters(): TypedIdentifier[] {
    return this.usingParameters;
  }

  public getChangingParameters(): TypedIdentifier[] {
    return this.changingParameters;
  }

///////////////

  private findType(type: new () => Expression, scope: CurrentScope): TypedIdentifier[] {
    const found = this.node.findFirstExpression(type);
    if (found === undefined) {
      return [];
    }
    return this.findParams(found, scope);
  }

  private findParams(node: ExpressionNode | StatementNode, scope: CurrentScope) {
    const res: TypedIdentifier[] = [];
    for (const param of node.findAllExpressions(Expressions.FormParam)) {
//      const para = param.get() as Expressions.FormParam;
      res.push(new FormParam().runSyntax(param, scope, this.filename));
    }
    return res;
  }

}