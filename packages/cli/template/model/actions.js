export default {

  // Use like: $models.example.myAction()
  myAction({ $store, $models }) {
    console.log("myAction");
  },

  // Use like: $models.example.myActionWithParam( id )
  myActionWithParam({ $store, $models }, id) {
    console.log("myActionWithParam");
  },
}
