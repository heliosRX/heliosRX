import registryModule from './registry'

export default function setup( name ) {
  registryModule.name = name;
  registryModule.namespaced = true;
  // TODO: state as function
  return registryModule;
}
