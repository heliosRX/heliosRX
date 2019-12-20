// import { defaults, isNil, isNumber, isInteger, isString, isArray, isFunction, isFinite } from "lodash";

export const isNumber = {
  bolt_type: () => 'Number',
  frontend: (v) => isNumber( v )
}

export const isString = {
  bolt_type: () => 'String',
  frontend: (v) => isString( v )
}
