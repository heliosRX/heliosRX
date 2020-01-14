import heliosrx from 'heliosrx'
import exampleModelDefinition from './example';

export const example = new heliosrx.GenericStore(
  '/examples/*',
  exampleModelDefinition
);
