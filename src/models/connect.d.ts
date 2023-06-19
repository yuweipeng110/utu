import type { MenuDataItem, Settings as ProSettings } from '@ant-design/pro-layout';
import { GlobalModelState } from './global';
import { UserModelState } from './user';
import type { StateType } from './login';
import { AppModelState } from './app';

export { GlobalModelState, UserModelState, AppModelState };

export type Loading = {
  global: boolean;
  effects: Record<string, boolean | undefined>;
  models: {
    global?: boolean;
    menu?: boolean;
    setting?: boolean;
    user?: boolean;
    login?: boolean;
    app?: boolean;
    group?: boolean;
  };
};

export type ConnectState = {
  global: GlobalModelState;
  loading: Loading;
  settings: ProSettings;
  user: UserModelState;
  login: StateType;
  app: AppModelState;
  group: AppModelState;
  rule: RuleModelState;
};

export type Route = {
  routes?: Route[];
} & MenuDataItem;
