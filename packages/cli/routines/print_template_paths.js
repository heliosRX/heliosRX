/* Prints all store paths */

let all_stores = require("../../src/models/config.js")

/* If we run on node, print paths */
for ( let storeName in all_stores ) {
  const store = all_stores[ storeName ];
  console.log(storeName, "-->", store.previewPath( '{id}' ));
}
