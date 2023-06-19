/**
 * 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 */
export default {
  dev: {
    '/api/v1/user/currentUser': {
      // target: 'http://rap2api.taobao.org/app/mock/277049',
      // target: 'http://engine.amap.test',
      // target: 'http://30.96.217.100:7001/',
      // target: 'http://30.87.241.80:7001/',
      target: 'http://11.122.22.1/',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
    '/api/': {
      // target: 'http://30.87.241.80:7001/',
      target: 'http://11.122.22.1/',
      // target: 'http://engine.amap.test/',
      changeOrigin: true,
    },
  },
  test: {
    '/api/': {
      // target: 'http://30.28.66.121:7001/',
      target: 'http://engine.amap.test/',
      // target: 'http://30.28.65.163/',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
  pre: {
    '/api/': {
      target: 'your pre url',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
};
