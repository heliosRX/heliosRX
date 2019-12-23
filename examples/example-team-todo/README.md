# heliosRX Example: Team chat

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

## Folder Structure

```
├── db               - Admin and database scripts (migration, setup, ...)
│   ├── lib          - Common library for admin scripts
│   └── rules        - Script for auto-generating and auto-checking firebase security rules
│       |── create_rules.js   - add new database models to get necessary permission
│       └── rules.bolt        - add new database models to get necessary permission
├── functions        - Cloud functions
│   └── api          - "Cross compiled" core functions (So we can use the ORM layer/DB abstraction layer in the backend as well)
├── src              - Goalpilot Client Code
│   ├── api           - Common Goalpilot functions (Can be accessed through this.$api) - also available in backend
│   ├── generic_api   - Goalpilot ORM / DB abstraction layer ()
│   ├── i18n          - i18n related libs
│   │   └── moment    - Extended moment.js version for Goalpilot. Do not use moment directly.
│   ├── models
│   │   ├── *         - Goalpilot model definitions (Can be accessed through this.$models)
│   │   └── config.js - Models are assigned to DB paths here
│   └── store         - Vuex state management
│       ├── app       - Vuex store for app state management
│       └── *         - All other stores are legacy code! We're trying to move away from vuex and use the ORM-layer instead!
|   ├── resource-loader.js - Global resource loader
|   └── main.js            - Code entry file
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
