import React from 'react';
import { history } from 'umi';
import { Form, message } from 'antd';
import { ModalForm, ProFormTextArea } from '@ant-design/pro-form';
import { PackageInfo } from '@/models/package';
import { addStrategyPackageContent } from '@/services/package';
import { getPageQuery } from '@/utils/utils';
import _ from 'lodash';

export type SavePackageProps = {
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  currentPackageData?: PackageInfo;
  setIsLoading: any;
  strategyContentList: any;
  flowContentList: any;
  setRefreshRandom: any;
  resetStrategyForm: any;
};

const SavePackage: React.FC<SavePackageProps> = (props) => {
  const {
    visible,
    onVisibleChange,
    currentPackageData,
    setIsLoading,
    strategyContentList,
    flowContentList,
    setRefreshRandom,
    resetStrategyForm,
  } = props;
  const queryParams = getPageQuery();
  const packageId = queryParams['id'];
  const appId = queryParams['app_id'];
  const [form] = Form.useForm();

  const onSubmit = async (values: any) => {
    const resetStrategyContentList = strategyContentList.slice(1);
    const resetFlowContentList = flowContentList.slice(1);
    if (_.isEmpty(resetStrategyContentList) && _.isEmpty(resetFlowContentList)) {
      message.info('策略列表 或 决策流列表不可为空！');
      return false;
    }
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在保存...', key: loadingKey, duration: 0 });
    const params = {
      appId: Number(appId),
      packageId: Number(packageId),
      changeDesc: form.getFieldValue('changeDesc'),
      version: currentPackageData?.version,
      strategyContentList: resetStrategyContentList.map((item: any, index: number) => {
        return {
          ...item,
          index,
        };
      }),
      flowContentList: resetFlowContentList.map((item: any, index: number) => {
        return {
          ...item,
          index,
        };
      }),
    };
    setIsLoading(true);
    const res = await addStrategyPackageContent(params);
    setIsLoading(false);
    if (res.code !== 1) {
      message.error({ content: res.message, key: loadingKey, duration: 2 });
      return false;
    }
    message.success({ content: '保存成功!', key: loadingKey, duration: 2 });
    history.push(`/knowledge/package/update?app_id=${appId}&id=${packageId}`);
    setRefreshRandom((Math.random() * 1000000).toFixed(0));
    // 重置选择
    resetStrategyForm();
    return true;
  };

  const onFinish = async (values: any) => {
    const success = await onSubmit(values);
    if (!success) {
      return false;
    }
    onVisibleChange(false);
    // if (actionRef.current) {
    //   actionRef.current.reload();
    // }
    return true;
  };

  return (
    <ModalForm
      title="保存包"
      visible={visible}
      onVisibleChange={(visibleValue) => {
        form.resetFields();
        onVisibleChange(visibleValue);
      }}
      form={form}
      onFinish={onFinish}
    >
      <ProFormTextArea
        name="changeDesc"
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

export default SavePackage;
