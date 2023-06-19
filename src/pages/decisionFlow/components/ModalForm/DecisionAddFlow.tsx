import React, { useEffect, useState } from 'react';
import { connect, useRequest } from 'umi';
import type { ConnectProps } from 'umi';
import { ConnectState } from '@/models/connect';
import { Button, Form, message, Spin, Empty } from 'antd';
import { InfoCircleTwoTone } from '@ant-design/icons';
import { ModalForm, ProFormText, ProFormTextArea, ProFormSelect } from '@ant-design/pro-form';
import { GroupInfo } from '@/models/group';
import { AppInfo } from '@/models/app';
import { FlowInfo } from '@/models/flow';
import { addFlow } from '@/services/flow';
import { queryPackageList } from '@/services/package';
import _ from 'lodash';

export type DecisionAddFlowProps = {
  actionRef: any;
  title: string;
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  currentData?: FlowInfo;
  isView?: boolean;
  currentApp?: AppInfo;
  currentGroup?: GroupInfo;
} & Partial<ConnectProps>;

const DecisionAddFlow: React.FC<DecisionAddFlowProps> = (props) => {
  const {
    actionRef,
    title,
    visible,
    onVisibleChange,
    currentData,
    isView,
    currentApp,
    currentGroup,
  } = props;
  const appId = currentApp && currentApp.id;
  const [form] = Form.useForm();
  const initialValues = !_.isEmpty(currentData) ? { ...currentData } : {};
  const [packageOptions, setPackageOptions] = useState([]);

  const {
    loading: packageLoading,
    run: packageRun,
    cancel: packageCancel,
  } = useRequest(queryPackageList, {
    debounceInterval: 500,
    manual: true,
    formatResult: (res) => {
      const newOptions = res.data.datas.map((item: any) => {
        return {
          business_data: item,
          value: item.id,
          label: `${item.name}(${item.description})`,
        };
      });
      setPackageOptions(newOptions);
    },
  });

  useEffect(() => {
    if (visible) {
      packageRun({
        pageSize: 10,
        pageIndex: 0,
        appId,
        groupId: currentGroup && currentGroup.groupId,
      });
    }
  }, [visible]);

  const handleSearchPackage = (value: string) => {
    if (value.length === 0) return;
    setPackageOptions([]);
    packageRun({
      pageSize: 10,
      pageIndex: 0,
      appId,
      groupId: currentGroup && currentGroup.groupId,
      name: value,
    });
  };

  const onSubmit = async (values: any) => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在保存...', key: loadingKey, duration: 0 });
    const params = {
      ...values,
      appId,
    };
    const res = await addFlow(params);
    if (res.code !== 1) {
      message.error({ content: res.message, key: loadingKey, duration: 2 });
      return false;
    }
    message.success({ content: '保存成功!', key: loadingKey, duration: 2 });
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
      submitter={{
        render: (props, defaultDoms) => {
          return [
            isView ? (
              <Button key="close" onClick={() => onVisibleChange(false)}>
                关闭
              </Button>
            ) : (
              defaultDoms
            ),
          ];
        },
      }}
    >
      <ProFormSelect
        name="packageId"
        label="所属包"
        showSearch
        options={packageOptions}
        rules={[
          {
            required: true,
          },
        ]}
        fieldProps={{
          showArrow: true,
          filterOption: false,
          onSearch: (value) => handleSearchPackage(value),
          onBlur: packageCancel,
          onClear: async () => {
            await packageRun({
              pageSize: 10,
              pageIndex: 0,
              appId,
              groupId: currentGroup && currentGroup.groupId,
            });
          },
          onClick: async () => {
            if (!form.getFieldValue('packageId')) {
              await packageRun({
                pageSize: 10,
                pageIndex: 0,
                appId,
                groupId: currentGroup && currentGroup.groupId,
              });
            }
          },
          loading: packageLoading,
          notFoundContent: packageLoading ? <Spin size="small" /> : <Empty />,
        }}
      />
      <ProFormText
        name="name"
        label="决策流名称"
        rules={[
          { required: true },
          {
            pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
            message: '英文开头，支持英文、数字、下划线',
          },
        ]}
        tooltip={{
          title: '英文开头，支持英文、数字、下划线',
          icon: <InfoCircleTwoTone />,
        }}
        disabled={isView || currentData ? true : false}
      />
      <ProFormTextArea
        name="description"
        label="描述"
        rules={[
          {
            required: true,
            message: '描述为必填项',
          },
        ]}
        disabled={isView || currentData ? true : false}
      />
    </ModalForm>
  );
};

export default connect(({ app }: ConnectState) => ({
  currentApp: app.currentApp,
  currentGroup: app.currentGroup,
}))(DecisionAddFlow);
