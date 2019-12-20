import Vue from 'vue'
const ENABLE_OPTIMIZER_DEBUG_SIDEBAR = false;

/*
Helper function that return an object from local storage or a default value
*/
function localStorageGetWithDefault(key, default_value) {
  var value = localStorage.getItem(key);
  if ( value === null ) {
    return default_value;
  }
  return JSON.parse(value);
}

function localStorageSet(key, value) {
  return localStorage.setItem(key, value);
}

function cookieGetFlag( name, defaultValue = false ) {
  return true
}

function cookieSetFlag( name, value ) {
}

// TODO: Split
function initialState() {
  return {
    flexGridEnabled: false,
    menubar: {
      opened:        cookieGetFlag('menubar.status', true),
      showFavorites: cookieGetFlag('menubar.showFavorites', false),
      collapseGoals: cookieGetFlag('menubar.collapseGoals', false),
      collapseTeam:  cookieGetFlag('menubar.collapseTeam', false),
      withoutAnimation: false
    },
    dayplanner_sidebar: cookieGetFlag('dayplanner.sidebarStatus', false),
    dayplanner_placeholder: false,
    dayplanner: {
      pinned:            cookieGetFlag('dayplanner.pinned', false),
      collapseProjects:  cookieGetFlag('dayplanner.collapseProjects', true),
      collapseToDoLists: cookieGetFlag('dayplanner.collapseToDoLists', true),
      collapseTemplates: cookieGetFlag('dayplanner.collapseTemplates', true),
      showAll:           cookieGetFlag('dayplanner.showAll', true), // Default: show all
    },
    sessionbar: {
      opened: cookieGetFlag('sessionbar.status'),
    },
    debugtool: {
      show: cookieGetFlag('debug.debugtoolStatus', false) && ENABLE_OPTIMIZER_DEBUG_SIDEBAR,
    },
    show_debug: !!+cookieGetFlag('debug.show'),
    disable_optimizer: !!+cookieGetFlag('debug.disable-optimizer'),
    device: 'desktop',
    size: cookieGetFlag('size') || 'medium',
    visionboardPreviewBase64: null,
    kanban_scroll_position: 0,
    visionboard_edit_mode: false,
    visionboard_challenge_sidebar: false,
    intro: {
      // true = show, false = hide
      dayplanner_drag: localStorageGetWithDefault('intro.dayplanner_drag', true)
      // ...
    },
    active_topbar_menu: null,
    active_sidebar_menu: 'TODAY', // default
    active_user_chat: null,
    connected: true, // app is offline or online? (default should be true. Use case: user logs out an in again)
  }
}

export default {
  namespaced: true,

  state: initialState(),

  getters: {
    flexGridEnabled: ({ flexGridEnabled }) => flexGridEnabled,
    menubar: state => state.menubar,
    dayplanner_sidebar: state => state.dayplanner_sidebar,
    dayplanner_placeholder: state => state.dayplanner_placeholder,
    dayplanner: state => state.dayplanner,
    dayplannerSidebarIsPinned: (state) => state.dayplanner.pinned,
    sessionbar: state => state.sessionbar,
    debugtool: state => state.debugtool,
    device: state => state.device,
    size: state => state.size,
    kanban_scroll_position: state => state.kanban_scroll_position,
    visionboardPreview: state => {
      let img = new Image();
      img.src = state.visionboardPreviewBase64 || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='; /* 1x1 black pixel */
      return img;
    },
    visionboard_edit_mode: state => state.visionboard_edit_mode,
    visionboard_challenge_sidebar: state => state.visionboard_challenge_sidebar,
    SHOW_DEBUG: (state) => state.show_debug,
    OPTIMIZER_DISABLE: (state) => state.disable_optimizer,
    active_topbar_menu: (state) => state.active_topbar_menu,
    active_sidebar_menu: (state) => state.active_sidebar_menu,
    active_user_chat: (state) => state.active_user_chat,
    intro: (state) => state.intro,
    connected: (state) => state.connected,

    user_get_language: () => {
      // TODO: Used by watcher
      return null; // $models.userSettings.getters.user_get_language
    },

    user_get_dateformat: () => {
      // TODO: Used by watcher
      return null; // $models.userSettings.getters.user_get_dateformat;
    },

    user_get_timezone: () => {
      // TODO: Used by watcher
      return null; // $models.userSettings.getters.user_get_timezone;
    },
  },

  mutations: {
    SET_FLEXGRID(state, enabled) {
      state.flexGridEnabled = enabled;
    },

    TOGGLE_SIDEBAR: state => {
      cookieSetFlag('menubar.status', !state.menubar.opened)
      state.menubar.opened = !state.menubar.opened
      state.menubar.withoutAnimation = false
    },

    CLOSE_SIDEBAR: (state, withoutAnimation) => {
      cookieSetFlag('menubar.status', false)
      state.menubar.opened = false
      state.menubar.withoutAnimation = withoutAnimation
    },

    SHOW_SIDEBAR: (state, withoutAnimation) => {
      cookieSetFlag('menubar.status', true)
      state.menubar.opened = true
      state.menubar.withoutAnimation = withoutAnimation
    },

    SET_SIDEBAR_FAVORITES( state, value ) {
      cookieSetFlag('menubar.showFavorites', value)
      state.menubar.showFavorites = value;
    },

    SET_SIDEBAR_COLLAPSE_GOAL( state, value ) {
      cookieSetFlag('menubar.collapseGoals', value)
      state.menubar.collapseGoals = value;
    },

    SET_SIDEBAR_COLLAPSE_TEAM( state, value ) {
      cookieSetFlag('menubar.collapseTeam', value)
      state.menubar.collapseTeam = value;
    },

    SET_DAYPLANNER_SIDEBAR_STATE(state, value) {
      cookieSetFlag('dayplanner.sidebarStatus', value)
      state.dayplanner_sidebar = value;
    },

    SET_DAYPLANNER_PLACEHOLDER_STATE(state, value) {
      // cookieSetFlag('dayplanner.placeholderStatus', value)
      state.dayplanner_placeholder = value;
    },

    SET_DAYPLANNER_COLLAPSE_PROJECTS(state, value) {
      cookieSetFlag('dayplanner.collapseProjects', value)
      state.dayplanner.collapseProjects = value;
    },

    SET_DAYPLANNER_COLLAPSE_TODOLISTS(state, value) {
      cookieSetFlag('dayplanner.collapseToDoLists', value)
      state.dayplanner.collapseToDoLists = value;
    },

    SET_DAYPLANNER_COLLAPSE_TEMPLATES(state, value) {
      cookieSetFlag('dayplanner.collapseTemplates', value)
      state.dayplanner.collapseTemplates = value;
    },

    SET_DAYPLANNER_SIDEBAR_PINNED_STATUS(state, value) {
      cookieSetFlag('dayplanner.pinned', value)
      state.dayplanner.pinned = value;
    },

    SET_DAYPLANNER_SHOWALL_STATE(state, value) {
      cookieSetFlag('dayplanner.showAll', value)
      state.dayplanner.showAll = value;
    },

    TOGGLE_SESSIONBAR: state => {
      cookieSetFlag('sessionbar.status', !state.sessionbar.opened)
      state.sessionbar.opened = !state.sessionbar.opened
    },

    TOGGLE_DEBUGBAR: state => {
      cookieSetFlag('debug.debugtoolStatus', !state.debugtool.show)
      if ( ENABLE_OPTIMIZER_DEBUG_SIDEBAR ) {
        state.debugtool.show = !state.debugtool.show
      }
    },

    TOGGLE_DEVICE: (state, device) => {
      state.device = device
    },

    SET_SIZE: (state, size) => {
      state.size = size
      cookieSetFlag('size', size)
    },

    SET_KANBAN_SCROLL_POSITION(state, pos) {
      state.kanban_scroll_position = pos;
    },

    SET_VISIONBOAR_PREVIEW_BASE64(state, blob) {
      state.visionboardPreviewBase64 = blob;
    },

    SET_CONNECTION_STATUS(state, status) {
      state.connected = !!status;
    },

    TOGGLE_VISIONBOARD_EDIT_MODE(state) {
      state.visionboard_edit_mode = !state.visionboard_edit_mode;
    },

    TOGGLE_VISIONBOARD_CHALLENGE_SIDEBAR(state) {
      state.visionboard_challenge_sidebar = !state.visionboard_challenge_sidebar;
    },

    DISABLE_VISIONBOARD_EDIT_MODE(state) {
      state.visionboard_edit_mode = false
    },

    DISABLE_VISIONBOARD_CHALLENGE_SIDEBAR(state) {
      state.visionboard_challenge_sidebar = false
    },

    SET_DEBUG(state, value) {
      cookieSetFlag('debug.show', value)
      state.show_debug = value;
    },

    SET_OPTIMIZER_DISABLE(state, value) {
      cookieSetFlag('debug.disable-optimizer', value)
      state.disable_optimizer = value;
    },

    SET_ACTIVE_TOPBAR_MENU( state, value ) {
      state.active_topbar_menu = value
    },

    SET_ACTIVE_SIDEBAR_MENU( state, value ) {
      state.active_sidebar_menu = value
    },

    SET_ACTIVE_USER_CHAT( state, value ) {
      state.active_user_chat = value
    },

    SET_INTRO_FLAG: (state, { flag, show }) => {
      if ( ![ 'dayplanner_drag' ].includes(flag) ) {
        throw new Error('Invalid flag: ' + flag)
      }
      Vue.set(state.intro, flag, show);
      localStorageSet('intro.' + flag, show)
    },

    RESET(state) {
      const s = initialState()
      Object.keys(s).forEach(key => {
        state[key] = s[key]
      })
    },
  },

  actions: {

    /* goToChat({ commit }, { contactId }) {
      commit('SET_ACTIVE_SIDEBAR_MENU', 'CHAT' )
      commit('SET_ACTIVE_USER_CHAT', contactId )
    }, */

    setDayplannerSidebar({ commit }, value) {
      commit('SET_DAYPLANNER_SIDEBAR_STATE', value);
    },

    setDayplannerPlaceholder({ commit }, value) {
      commit('SET_DAYPLANNER_PLACEHOLDER_STATE', value);
    },

    setDayplannerShowAll({ commit }, value) {
      commit('SET_DAYPLANNER_SHOWALL_STATE', value);
    },

    toggleSessionBar({ commit }) {
      commit('TOGGLE_SESSIONBAR')
    },

    toggleSideBar({ commit }) {
      commit('TOGGLE_SIDEBAR')
    },

    toggleDebugBar({ commit }) {
      commit('TOGGLE_DEBUGBAR')
    },

    closeSideBar({ commit }, { withoutAnimation }) {
      commit('CLOSE_SIDEBAR', withoutAnimation)
    },

    showSideBar({ commit }, { withoutAnimation }) {
      commit('SHOW_SIDEBAR', withoutAnimation)
    },

    toggleDevice({ commit }, device) {
      commit('TOGGLE_DEVICE', device)
    },

    setSize({ commit }, size) {
      commit('SET_SIZE', size)
    },

    setVisionboardPreviewBase64({ commit }, blob) {
      commit('SET_VISIONBOAR_PREVIEW_BASE64', blob)
    },

    toggleVisionboardEditMode({ commit }) {
      commit('DISABLE_VISIONBOARD_CHALLENGE_SIDEBAR')
      commit('TOGGLE_VISIONBOARD_EDIT_MODE')
    },

    toggleVisionboardChallengeSidebar({ commit }) {
      commit('DISABLE_VISIONBOARD_EDIT_MODE')
      commit('TOGGLE_VISIONBOARD_CHALLENGE_SIDEBAR')
    },

    hideIntro({ commit }, flag) {
      commit('SET_INTRO_FLAG', { flag, show: false })
    },

    showIntro({ commit }, flag) {
      commit('SET_INTRO_FLAG', { flag, show: true })
    },
  },
}
