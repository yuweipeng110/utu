import type { Effect, Reducer } from 'umi';
import { history } from 'umi';

import { queryScene, querySceneList } from '@/services/app';
import { GroupInfo } from './group';

export type AppInfo = {
  id: number;
  appCode: string;
  appName: string;
  appDesc: string;
  createUser: string;
  createTime: string;
  emps: BucUser[];
  isCanDeleted: boolean;
};

export type BucUser = {
  roleId: number;
  empId: string;
  empName: string;
  nickName: string;
};

export type AppScene = {
  appId: number;
  appCode: string;
  appName: string;
  sceneId: number;
  sceneCode: string;
  sceneName: string;
  maxFlowRatio: number;
  surplusFlowRatio: number;
  diversionId: string;
  upgradedFeature: any;
};

export type InitMaster = {
  appId: number;
  sceneId: number;
  branchId: number;
};

export type AppModelState = {
  sceneList?: [];
  currentScene?: AppScene;
  currentApp?: AppInfo;
  currentGroup?: GroupInfo;
};

export type AppModelType = {
  namespace: 'app';
  state: AppModelState;
  effects: {
    fetchList: Effect;
    fetchAndSelectScene: Effect;
    selectScene: Effect;
    selectApp: Effect;
    selectGroup: Effect;
  };
  reducers: {
    saveSceneList: Reducer<AppModelState>;
    saveCurrentScene: Reducer<AppModelState>;
    saveCurrentApp: Reducer<AppModelState>;
    saveCurrentGroup: Reducer<AppModelState>;
  };
};

const AppModel: AppModelType = {
  namespace: 'app',

  state: {
    sceneList: [],
    currentScene: JSON.parse(<string>localStorage.getItem('scene')),
    currentApp: JSON.parse(<string>localStorage.getItem('app')),
    currentGroup: JSON.parse(<string>localStorage.getItem('group')),
  },

  effects: {
    *fetchList(action, { call, put }) {
      const response = yield call(querySceneList, { ...action.payload });
      if (!response) {
        history.push('/error');
        return;
      }
      yield put({
        type: 'saveSceneList',
        payload: response.datas,
      });
    },
    *fetchAndSelectScene(action, { call, put }) {
      const response = yield call(queryScene, { ...action.payload });
      if (!response) {
        localStorage.removeItem('scene');
        history.push('/error');
        return;
      }
      yield put({
        type: 'saveCurrentScene',
        payload: response.data,
      });
    },
    *selectScene(action, { put }) {
      yield put({
        type: 'saveCurrentScene',
        payload: action.payload,
      });
    },
    *selectApp(action, { put }) {
      if (action.payload !== null) {
        localStorage.setItem('app', JSON.stringify(action.payload));
      } else {
        localStorage.removeItem('app');
      }
      yield put({
        type: 'saveCurrentApp',
        payload: action.payload,
      });
    },
    *selectGroup(action, { put }) {
      if (action.payload !== null) {
        localStorage.setItem('group', JSON.stringify(action.payload));
      } else {
        localStorage.removeItem('group');
      }
      yield put({
        type: 'saveCurrentGroup',
        payload: action.payload,
      });
    },
  },

  reducers: {
    saveSceneList(state, action) {
      return {
        ...state,
        sceneList: action.payload || {},
      };
    },
    saveCurrentScene(state, action) {
      if (action.payload !== null) {
        localStorage.setItem('scene', JSON.stringify(action.payload));
      } else {
        history.push('/error');
      }
      return {
        ...state,
        currentScene: action.payload || {},
      };
    },
    saveCurrentApp(state, action) {
      return {
        ...state,
        currentApp: action.payload || {},
      };
    },
    saveCurrentGroup(state, action) {
      return {
        ...state,
        currentGroup: action.payload || {},
      };
    },
  },
};

export default AppModel;
