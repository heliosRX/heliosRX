import mutations from './mutations'

export const genericStoreMutations = {}

Object.keys(mutations).forEach(type => {
  genericStoreMutations[type] = (state, payload) => {
    mutations[type](state, payload)
  }
})
