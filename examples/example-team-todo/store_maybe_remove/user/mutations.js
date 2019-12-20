export default {
  SET_PROFILE(state, userAuth) {
    state.loggedIn = true;
    // console.log("SET_PROFILE", profile);
    state.userAuth = {
      name:    userAuth.displayName,
      email:   userAuth.email,
      picture: userAuth.photoURL,
      id:      userAuth.uid
    };
  },

  LOGOUT(state) {
    state.loggedIn = false;
    state.userAuth = {};
    // state.userData = {};
    state.initialized = false;
  },

  // SET_USER_LIST(state, list) {
  //   state.userList = list;
  // },

  // TOGGLE_SIDEBAR(state) { // TODO: MOVE TO app
  //   state.sidebarOpen = !state.sidebarOpen;
  // },

  SET_INITIALIZED(state) {
    state.initialized = true;
  },
};
