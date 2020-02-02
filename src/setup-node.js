import { setDefaultDB } from './helpers.js'
import { setup as storeSetup } from './store/GenericStore.js'
import registryModule from './registry/module'
import setupExternalDeps, { _Vue, _Vuex } from './external-deps'

/* Usage:
let client_env = functions.config().client_env;
let config = {
  apiKey:             client_env.firebase_api_key,
  authDomain:         client_env.firebase_auth_domain,
  databaseURL:        client_env.firebase_database_url,
  projectId:          client_env.firebase_project_id,
  storageBucket:      client_env.firebase_storage_bucket,
  messagingSenderId:  client_env.firebase_messaging_sender_id
}

heliosRX.setup({
  firebaseConfig: config,
  runAsUser: false,
  models: { ... },
})
*/

export function setupNode( options ) {

  /*
  options.runAsUser: false | null | <String>,
  options.firebaseConfig: null | <FirebaseApp>,

  options.firebase
  options.devMode
  */

  // eslint-disable-next-line import/no-unresolved
  const admin = options.firebaseAdmin; // require('firebase-admin');

  // eslint-disable-next-line import/no-unresolved
  const Vue = options.Vue || _Vue;

  // eslint-disable-next-line import/no-unresolved
  const Vuex = options.Vuex || _Vuex;

  const usingLocalEmulator = process.env.FUNCTIONS_EMULATOR === 'true';

  if ( options.runAsUser ) {
    if ( usingLocalEmulator ) {
      console.log("[initializeApp] with default config", process.env.FIREBASE_CONFIG)
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    } else {
      // Test config with:
      admin.initializeApp();
    }
  } else {

    // TODO: Scope admin user to regular service user -> "support user"
    //       https://firebase.googleblog.com/2019/03/firebase-security-rules-admin-sdk-tips.html

    // INFO: This is the same as the env variable CLOUD_RUNTIME_CONFIG,
    //       which is only configured on host machine, not in local emulator!

    const config = options.firebaseConfig;

    console.log("[initializeApp] config", config)
    admin.initializeApp(config);
  }

  // Set default DB for generic API
  let defaultDb = admin.database()
  setDefaultDB( defaultDb );

  setupExternalDeps({
    Vue,
    models: options.models,
    db:     defaultDb,
  });

  storeSetup({
    Vue,
    firebase: admin
  })

  if ( Vue && Vuex ) {
    Vue.use( Vuex );
    let _registry = new Vuex.Store( registryModule( 'heliosRX' ) )
    setupExternalDeps({ Vuex, registry: _registry });

    // Initialize registry
    _registry.commit('INIT_REGISTRY');
  }

  /*
  // Merge user api with helios API
  let mergedApi = {};
  if ( options.userApi ) {
    mergedApi = options.userApi;
  }

  // Define $api
  Object.defineProperty(Vue.prototype, '$api', {
    get () { return mergedApi }
  })
  */

  // Setup heliosRX without Vue?
  // install( options.Vue, options )
}
