import mutations from './mutations'
import registry from './registry.js'

export const genericStoreMutations = {}

Object.keys(mutations).forEach(type => {
  genericStoreMutations[type] = (state, payload) => {
    mutations[type](state, payload)
  }
})

export default registry
