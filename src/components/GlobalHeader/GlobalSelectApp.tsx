import React, { useEffect, useMemo, useState } from 'react';
import { useRequest, connect, history, useLocation } from 'umi';
import type { ConnectProps, Dispatch } from 'umi';
import type { ConnectState } from '@/models/connect';
import ProForm, { ProFormSelect } from '@ant-design/pro-form';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Empty, Form, message, Modal, Spin } from 'antd';
import { getAppList } from '@/services/app';
import { AppInfo } from '@/models/app';
import { GroupInfo } from '@/models/group';
import { queryGroupList } from '@/services/group';
import { AddAppPubSubId, ChangeAppPubSubId, DeleteAppPubSubId } from '@/consts/const';
import PubSub from 'pubsub-js';
import { queryURLParameter } from '@/utils/utils';
import _ from 'lodash';
import './index.less';

const { confirm } = Modal;

export type GlobalSelectAppProps = {
  dispatch: Dispatch;
  currentGroup?: GroupInfo;
  currentApp?: AppInfo;
} & Partial<ConnectProps>;

const GlobalSelectApp: React.FC<GlobalSelectAppProps> = (props) => {
  const { dispatch, currentGroup, currentApp } = props;
  const [form] = Form.useForm();
  const queryParams = queryURLParameter();
  const appId = queryParams['app_id'];

  const [groupList, setGroupList] = useState<GroupInfo[]>([]);
  const [appList, setAppList] = useState([]);

  const { loading: groupLoading, run: groupRun } = useRequest(queryGroupList, {
    debounceInterval: 500,
    manual: true,
    formatResult: (res) => {
      const tempList = !_.isEmpty(currentGroup)
        ? _.uniqBy(res.data.groupInfoVOS.concat(currentGroup), 'groupId')
        : res.data.groupInfoVOS || [];
      setGroupList(tempList);
    },
  });

  const { loading: appLoading, run: appRun } = useRequest(getAppList, {
    debounceInterval: 500,
    manual: true,
    formatResult: (res) => {
      const tempList = !_.isEmpty(currentApp)
        ? _.uniqBy(res.data.datas.concat(currentApp), 'id')
        : res.data.datas || [];
      setAppList(tempList);
    },
  });

  useEffect(() => {
    groupRun({
      pageSize: 10,
      pageIndex: 0,
    });

    const addPubSub = PubSub.subscribe(AddAppPubSubId, async () => {
      await appRun({
        pageSize: 10,
        pageIndex: 0,
        groupId: currentGroup?.groupId,
      });
    });

    const changePubSub = PubSub.subscribe(ChangeAppPubSubId, async (msg: any, data: any) => {
      if (!_.isEmpty(data) && data.groupId !== currentApp?.groupId) {
        dispatch({
          type: 'app/selectApp',
          payload: null,
        });
        form.setFieldsValue({ appId: undefined });
      }
      await appRun({
        pageSize: 10,
        pageIndex: 0,
        groupId: currentGroup?.groupId,
      });
    });

    // const statusPubSub = PubSub.subscribe(StatusAppPubSubId, async (msg: any, data: any) => {
    //   setAppIsDisabled(data.disabled);
    // });

    return () => {
      PubSub.unsubscribe(addPubSub);
      PubSub.unsubscribe(changePubSub);
    };
  }, []);

  useEffect(() => {
    if (!_.isEmpty(currentGroup)) {
      appRun({
        pageSize: 10,
        pageIndex: 0,
        groupId: currentGroup?.groupId,
      });
    }
  }, [currentGroup]);

  useMemo(() => {
    const deletePubSub = PubSub.subscribe(DeleteAppPubSubId, async (msg: any, data: any) => {
      if (data.appId === currentApp?.id) {
        dispatch({
          type: 'app/selectApp',
          payload: null,
        });
        form.resetFields();
      }
      await appRun({
        pageSize: 10,
        pageIndex: 0,
        groupId: currentGroup?.groupId,
      });
    });
    return () => {
      PubSub.unsubscribe(deletePubSub);
    };
  }, [currentApp]);

  const handleSearchGroup = (value: string) => {
    if (value.length === 0) return;
    setGroupList([]);
    groupRun({
      pageSize: 10,
      pageIndex: 0,
      searchParam: value,
    });
  };

  const handleSearchApp = (value: string) => {
    if (value.length === 0) return;
    setAppList([]);
    appRun({
      pageSize: 10,
      pageIndex: 0,
      groupId: currentGroup?.groupId,
      searchParam: value,
    });
  };

  const { pathname } = useLocation();
  useEffect(() => {}, [pathname]);

  return (
    <ProForm
      form={form}
      layout={'horizontal'}
      className="form-revert"
      style={{ float: 'left' }}
      submitter={false}
    >
      <ProForm.Group>
        <ProFormSelect
          name="groupId"
          label="组"
          width={240}
          placeholder="请输入组名称或code"
          showSearch
          options={groupList.map((item: GroupInfo) => {
            return {
              business_data: item,
              value: item.groupId,
              label: `${item.groupCode}${item.groupDesc ? `（${item.groupDesc}）` : ''}`,
              option_label: item.groupCode,
            };
          })}
          fieldProps={{
            optionLabelProp: 'option_label',
            autoFocus: false,
            showArrow: true,
            filterOption: false,
            onSearch: (value) => handleSearchGroup(value),
            onChange: (value, option: any) => {
              form.setFieldsValue({ appId: undefined });
              dispatch({
                type: 'app/selectApp',
                payload: null,
              });
              if (value) {
                dispatch({
                  type: 'app/selectGroup',
                  payload: option.business_data,
                });
                appRun({
                  pageSize: 10,
                  pageIndex: 0,
                  groupId: value,
                });
              } else {
                dispatch({
                  type: 'app/selectGroup',
                  payload: null,
                });
              }
            },
            onClick: () => {
              groupRun({
                pageSize: 10,
                pageIndex: 0,
              });
            },
            onClear: async () => {
              await groupRun({
                pageSize: 10,
                pageIndex: 0,
              });
            },
            loading: groupLoading,
            notFoundContent: groupLoading ? <Spin size="small" /> : <Empty />,
          }}
          initialValue={!_.isEmpty(currentGroup) ? currentGroup!.groupId : undefined}
        />
        <ProFormSelect
          name="appId"
          label="应用"
          width={240}
          placeholder="请输入应用名称或code"
          showSearch
          options={appList.map((item: AppInfo) => {
            return {
              business_data: item,
              value: item.id,
              label: `${item.appCode}${item.appDesc ? `（${item.appDesc}）` : ''}`,
              option_label: item.appCode,
            };
          })}
          fieldProps={{
            optionLabelProp: 'option_label',
            autoFocus: false,
            showArrow: true,
            filterOption: false,
            onSearch: (value) => handleSearchApp(value),
            onChange: (value, option: any) => {
              if (value) {
                if (pathname === '/unselected') {
                  history.goBack();
                }
                if (!_.isEmpty(appId) && Number(appId) !== Number(value)) {
                  confirm({
                    title: '应用发生改变，是否跳转列表页面?',
                    icon: <ExclamationCircleOutlined />,
                    onOk() {
                      dispatch({
                        type: 'app/selectApp',
                        payload: option.business_data,
                      });
                      try {
                        const pathnameArr = pathname.split('/').filter((item) => item.length);
                        const pushUrl = `/${pathnameArr[0]}/${pathnameArr[1]}`;
                        history.push(pushUrl);
                      } catch (error) {
                        message.error(`跳转失败：${error}`);
                      }
                    },
                    onCancel() {
                      form.setFieldsValue({ appId: Number(appId) });
                    },
                  });
                } else {
                  dispatch({
                    type: 'app/selectApp',
                    payload: option.business_data,
                  });
                }
              } else {
                form.setFieldsValue({ appId: undefined });
                dispatch({
                  type: 'app/selectApp',
                  payload: null,
                });
              }
            },
            onClick: () => {
              appRun({
                pageSize: 10,
                pageIndex: 0,
                groupId: currentGroup?.groupId,
              });
            },
            onClear: async () => {
              await appRun({
                pageSize: 10,
                pageIndex: 0,
                groupId: currentGroup?.groupId,
              });
            },
            loading: appLoading,
            notFoundContent: appLoading ? <Spin size="small" /> : <Empty />,
          }}
          initialValue={!_.isEmpty(currentApp) ? currentApp!.id : undefined}
          disabled={!form.getFieldValue('groupId')}
        />
      </ProForm.Group>
    </ProForm>
  );
};

export default connect(({ app }: ConnectState) => ({
  currentGroup: app.currentGroup,
  currentApp: app.currentApp,
}))(GlobalSelectApp);
