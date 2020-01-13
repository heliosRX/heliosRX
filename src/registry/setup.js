import registryModule from './registry'
export default function setup( Vuex ) {
  return new Vuex.Store( registryModule );
}
