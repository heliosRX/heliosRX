import firebase from "@firebase/app";
import $models from '@/models'

// =============================================================================

export function user_update_online_status({ isOnline }) {
  return $models.userStatus.update( $models.user.defaultUserId, { isOnline } )
}

// -----------------------------------------------------------------------------
export function user_update_status_message({ statusMessage }) {
  return $models.userStatus.update( $models.user.defaultUserId, { statusMessage } )
}

// -----------------------------------------------------------------------------
export function user_update_settings( userPayload ) {
  return $models.userSettings.update( $models.user.defaultUserId, userPayload )
}

// -----------------------------------------------------------------------------
export function user_update_settings_by_prefix({ prefix, data }) {

  let payload = {}

  Object.keys(data).forEach(key => {
    payload[`${prefix}/${key}`] = data[key];
  });

  return this.user_update_settings( payload )
}

// -----------------------------------------------------------------------------
export function user_update_public_profile( userPayload ) {

  return $models.userPublic.update( $models.user.defaultUserId, userPayload )
}

// -----------------------------------------------------------------------------
export function user_update_profile_picture({ profilePicUrl }) {

  let user = firebase.auth().currentUser;

  let pAuthUser = user.updateProfile({ profilePic: profilePicUrl })

  let pUserStatus = $models.userStatus.update( $models.user.defaultUserId, {
    profilePic: profilePicUrl
  })

  let pUserPublic = user_update_public_profile({ profilePic: profilePicUrl })

  return Promise.all([ pAuthUser, pUserStatus, pUserPublic ])
}

// -----------------------------------------------------------------------------
export function user_reset_profile_picture() {

  let user = firebase.auth().currentUser;

  console.log("user", user)

  return $models.userStatus.update( $models.user.defaultUserId, {
    profilePic: user.photoURL || null,
  })
}

// -----------------------------------------------------------------------------
export function user_send_notification(payload) {
  // this.$api.user_send_notification({ message: 'test' })

  if ( !payload.message ) {
    throw new Error('message missing');
  }

  return $models.userNotificationInbox.add(payload)
}
