import { ObjectInterface } from "./types";

const nativeTypes: ObjectInterface = {
  string: 3,
  number: 1,
  boolean: 2,
  array: 4,
  object: 5,
  3: "string",
  1: "number",
  2: "boolean",
  4: "array",
  5: "object"
};

const dataSizes = {
  Number: 8,
  Boolean: 1,
  Key: 32
};

export { nativeTypes, dataSizes };
