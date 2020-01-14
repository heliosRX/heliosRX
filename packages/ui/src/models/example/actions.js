export default {
  doSomethingFancy({ $store, $models }) {
    console.log("doSomethingFancy");
  },
  pause({ $store, $models }, id) {
    console.log("pause");
  },
  resume({ $store, $models }, id) {
    console.log("resume");
  }
}
