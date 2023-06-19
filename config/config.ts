// https://umijs.org/config/
import { defineConfig } from 'umi';
import defaultSettings from './defaultSettings';
import cdnbuild from '@ali/cdn-build';
import proxy from './proxy';
import routes from './routes';
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';

let publicPath = '/';

const args = cdnbuild.getArgs();
var tag =
  args.tag ||
  args.path ||
  args['branch-name'] ||
  args['code-branch'] ||
  process.env.BUILD_GIT_BRANCH ||
  '';
if (tag === true) {
  tag = '';
}
tag += '';

if (cdnbuild.isDevelopment()) {
  if (tag.indexOf('daily2') >= 0) {
    publicPath = `//g-assets.daily2.taobao.net/amap-security-fe/amap-aos-fe-utu-management/${cdnbuild.getVersion()}/`;
  } else if (tag.indexOf('daily1') >= 0) {
    publicPath = `//g-assets.daily1.taobao.net/amap-security-fe/amap-aos-fe-utu-management/${cdnbuild.getVersion()}/`;
  } else {
    publicPath = `//dev.g.alicdn.com/amap-security-fe/amap-aos-fe-utu-management/${cdnbuild.getVersion()}/`;
  }
}
if (cdnbuild.isPrepub()) {
  publicPath = `//g-assets.prepub.taobao.net/amap-security-fe/amap-aos-fe-utu-management/${cdnbuild.getVersion()}/`;
}
if (cdnbuild.isProduction()) {
  publicPath = `//g.alicdn.com/amap-security-fe/amap-aos-fe-utu-management/${cdnbuild.getVersion()}/`;
}

const { REACT_APP_ENV } = process.env;

export default defineConfig({
  hash: false,
  antd: {},
  dva: {
    hmr: true,
  },
  history: {
    type: 'hash',
  },
  locale: {
    // default zh-CN
    default: 'zh-CN',
    antd: true,
    // default true, when it is true, will use `navigator.language` overwrite default
    baseNavigator: true,
  },
  dynamicImport: {
    loading: '@/components/PageLoading/index',
  },
  targets: {
    ie: 11,
  },
  chainWebpack: (memo, { env, webpack, createCSSRule }) => {
    memo.plugin('monaco-editor').use(MonacoWebpackPlugin, [
      {
        // available options are documented at https://github.com/Microsoft/monaco-editor-webpack-plugin#options
        languages: ['javascript', 'go', 'json', 'sql'],
      },
    ]);
  },
  // umi routes: https://umijs.org/docs/routing
  routes,
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    'primary-color': defaultSettings.primaryColor,
  },
  title: false,
  ignoreMomentLocale: true,
  proxy: proxy[REACT_APP_ENV || 'dev'],
  manifest: {
    basePath: '/',
  },
  esbuild: {},
  // https://github.com/zthxxx/react-dev-inspector
  plugins: ['react-dev-inspector/plugins/umi/react-inspector'],
  inspectorConfig: {
    // loader options type and docs see below
    exclude: [],
    babelPlugins: [],
    babelOptions: {},
  },
  publicPath,
});
