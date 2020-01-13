import { GenericStore, UIDMethod } from 'heliosrx'

import exampleModelDefinition from './example';

export const example = new GenericStore(
  "/example/*",
  exampleModelDefinition
);

export const example2 = new GenericStore(
  "/example2/*",
  exampleModelDefinition,
  { uidMethod: UIDMethod.TIMESTAMP }
);
