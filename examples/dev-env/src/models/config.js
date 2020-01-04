import GenericStore from 'heliosrx/src/store'
import { UIDMethod } from 'heliosrx/src/store/GenericStore'

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
