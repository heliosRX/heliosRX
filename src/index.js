import { install } from './install'

class VueLoader {
  static install() {}
}

VueLoader.install = install

export default VueLoader;

export { walkGet } from '@/lib/backends/firebase-rtdb/utils'
// export { walkGetSafe } from '@/generic_api/lib/generic_store/vuefire/utils'
