import $models from '@/models'

export default {
  // TODO: move to new stores and remove
  userData() {
    // DO NOT USE !!!
    // Use $models.userSettings.getNode( $models.user.defaultUserId ) instead
    // DO NOT USE !!!
    if ( $models.user.defaultUserId ) {
      // TODO: NOT REACTIVE !?
      return $models.userSettings.getNode( $models.user.defaultUserId )
    } else {
      // throw new Error('userData called before user exist') // ...or user logged out
      return null;
    }
  },

  userAuth: ({ userAuth }) => userAuth,

  loggedIn: ({ loggedIn }) => loggedIn,

  initialized: ({ initialized }) => initialized, // TODO: only used in resource loader
}
