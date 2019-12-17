export default {
  create({ displayName }, data) {
    return {
      displayName:   displayName,
      isOnline:      data.isOnline === undefined ? true : data.isOnline,
      lastSeen:      null,
      profilePic:    data.profilePic || null,
      taskId:        null,
      statusMessage: "status...",
    }
  },

  fields: {
    displayName: { validate_bolt_type: 'String' },
    isOnline: { validate_bolt_type: 'Boolean' },
    lastSeen: { validate_bolt_type: 'Timestamp' },
    profilePic: { validate_bolt_type: 'String' },
    taskId: { validate_bolt_type: 'AnyID' },
    statusMessage: { validate_bolt_type: 'String' },
  }
};
