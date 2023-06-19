import React, { useEffect, useState } from 'react';
import { useRequest, connect } from 'umi';
import type { ConnectProps, Dispatch } from 'umi';
import type { ConnectState } from '@/models/connect';
import { Empty, Form, message, Spin } from 'antd';
import ProForm, {
  ModalForm,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form';
import { addApp, editApp } from '@/services/app';
import { InfoCircleTwoTone } from '@ant-design/icons';
import { AddAppPubSubId, AppDeploy, ChangeAppPubSubId } from '@/consts/const';
import { queryAppGroupList } from '@/services/group';
import { GroupInfo } from '@/models/group';
import PubSub from 'pubsub-js';
import type { AppInfo } from '@/models/app';
import _ from 'lodash';

export type EditAppProps = {
  actionRef: any;
  title: string;
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  currentData: AppInfo;
  currentApp?: AppInfo;
  dispatch: Dispatch;
} & Partial<ConnectProps>;

const EditApp: React.FC<EditAppProps> = (props) => {
  const { actionRef, title, visible, onVisibleChange, currentData, currentApp, dispatch } = props;
  const [form] = Form.useForm();
  const initialValues = !_.isEmpty(currentData) ? { ...currentData } : { appDeploy: 1 };

  const [groupOptions, setGroupOptions] = useState([]);

  const {
    loading: groupLoading,
    run: groupRun,
    cancel: groupCancel,
  } = useRequest(queryAppGroupList, {
    debounceInterval: 500,
    manual: true,
    formatResult: (res) => {
      const newOptions = res.map((item: GroupInfo) => {
        return {
          business_data: item,
          value: item.groupId,
          label: `${item.groupCode}(${item.groupDesc})`,
          option_label: item.groupCode,
        };
      });
      setGroupOptions(newOptions);
    },
  });

  useEffect(() => {
    if (visible) {
      groupRun({});
    }
  }, [visible]);

  const handleSearchGroup = (value: string) => {
    if (value.length === 0) return;
    setGroupOptions([]);
    groupRun({
      searchParam: value,
    });
  };

  const handleCurrentApp = (appId: number, values: any) => {
    if (currentApp?.groupId !== values.groupId) {
      dispatch({
        type: 'app/selectApp',
        payload: null,
      });

    PubSub.publish(ChangeAppPubSubId, {
      ...currentData,
      ...values,
      id: appId,
    });
    }
  };

  const onSubmit = async (values: any) => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在保存...', key: loadingKey, duration: 0 });
    const params = {
      ...values,
      id: currentData && currentData.id,
      appCode: values.appCode.replace(/\s+/g, ''),
    };
    const res = !currentData ? await addApp(params) : await editApp(params);
    if (res.code !== 1) {
      message.error({ content: res.message, key: loadingKey, duration: 2 });
      return false;
    }
    message.success({ content: '保存成功!', key: loadingKey, duration: 2 });
    handleCurrentApp(currentData?.id as number, values);
    return true;
  };

  const onFinish = async (values: any) => {
    const success = await onSubmit(values);
    if (!success) {
      return false;
    }
    onVisibleChange(false);
    if (actionRef.current) {
      actionRef.current.reload();
    }
    PubSub.publish(AddAppPubSubId);
    return true;
  };

  return (
    <ModalForm
      title={title}
      visible={visible}
      onVisibleChange={(visibleValue) => {
        form.resetFields();
        onVisibleChange(visibleValue);
      }}
      form={form}
      onFinish={onFinish}
      initialValues={initialValues}
    >
      <ProForm.Group>
        <ProFormSelect
          name="groupId"
          label="所属组"
          width="md"
          showSearch
          options={groupOptions}
          rules={[
            {
              required: true,
            },
          ]}
          fieldProps={{
            showArrow: true,
            filterOption: false,
            onSearch: (value) => handleSearchGroup(value),
            onBlur: groupCancel,
            onClear: async () => {
              await groupRun({});
            },
            loading: groupLoading,
            notFoundContent: groupLoading ? <Spin size="small" /> : <Empty />,
          }}
        />
        <ProFormRadio.Group
          name="appDeploy"
          label="部署方式"
          radioType="button"
          fieldProps={{
            buttonStyle: 'solid',
          }}
          options={Object.keys(AppDeploy).map((key) => {
            return {
              value: Number(key),
              label: AppDeploy[key],
            };
          })}
          tooltip={{
            title:
              '张北中心（NA610和NA620），三机房包含 张北中心（NA610和NA620）、深圳SU121、上海EA119',
            icon: <InfoCircleTwoTone />,
          }}
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormText
          rules={[
            {
              required: true,
              message: 'APP Code为必填项',
            },
          ]}
          width="md"
          name="appCode"
          label="APP Code"
        />
      </ProForm.Group>
      <ProFormTextArea
        name="appDesc"
        label="描述"
        rules={[
          {
            required: true,
          },
        ]}
      />
    </ModalForm>
  );
};

export default connect(({ app }: ConnectState) => ({
  currentApp: app.currentApp,
}))(EditApp);
