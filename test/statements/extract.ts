import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "EXTRACT header.",
  "EXTRACT.",
];

statementType(tests, "EXTRACT", Statements.Extract);