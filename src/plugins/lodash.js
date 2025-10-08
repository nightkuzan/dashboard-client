import lodash from "lodash";

export default {
  install(app) {
    app.config.globalProperties.$_ = lodash;
    app.provide("_", lodash);
  },
};
