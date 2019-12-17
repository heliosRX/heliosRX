import GenericStore, { UIDMethod } from '@/generic_api/lib/generic_store/GenericStore'

import exampleModelDefinition from './example';

export const example = new GenericStore(
  "/example/*",
  exampleModelDefinition
);
