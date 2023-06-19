import React, { useEffect, useState } from 'react';
import { useRequest, history } from 'umi';
import { Form, Spin, message } from 'antd';
import {
  ModalForm,
  ProFormText,
  ProFormTextArea,
  ProFormDigit,
  ProFormSelect,
} from '@ant-design/pro-form';
import type { BranchDetail } from '@/models/rule';
import {
  addMasterRuleBranch,
  addRuleBranch,
  cloneRuleBranch,
  getMasterRuleBranch,
  queryRuleBranch,
} from '@/services/rule';
import { getPageQuery } from '@/utils/utils';
import _ from 'lodash';

export type modalFormProps = {
  title: string;
  actionRef: any;
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  forkBranch?: BranchDetail;
};

const BranchModalForm: React.FC<modalFormProps> = (props) => {
  const { title, actionRef, visible, onVisibleChange, forkBranch } = props;
  const [form] = Form.useForm();
  const queryParams = getPageQuery();
  const appId = queryParams.app_id;
  const sceneId = queryParams.scene_id;

  const [isExistMaster, setIsExistMaster] = useState<boolean>(false);
  const [ruleBranchOptions, setRuleBranchOptions] = useState([]);

  /**
   * 初始化源分支ID值 默认master
   * @param branch
   */
  const initSrcBranchIdInitVal = (branch: BranchDetail) => {
    if (branch.branchType === 0) {
      form.setFieldsValue({
        srcBranchId: branch.branchId,
      });
    }
  };

  const loadMasterRuleBranch = async () => {
    const res = await getMasterRuleBranch({ appId, sceneId });
    setIsExistMaster(res.data !== null);
  };

  const { loading, run, cancel } = useRequest(queryRuleBranch, {
    debounceInterval: 500,
    manual: true,
    formatResult: (res) => {
      if (res && res.datas.length > 0) {
        const options = res.datas.map((item: BranchDetail) => {
          initSrcBranchIdInitVal(item);
          return {
            business_data: item,
            value: item.branchId,
            label: item.branchName,
          };
        });
        setRuleBranchOptions(options.filter((item: any) => item.business_data.branchType === 0));
      }
    },
  });

  useEffect(() => {
    if (visible) {
      loadMasterRuleBranch();
      if (!_.isEmpty(forkBranch)) {
        const forkOption = { value: forkBranch?.branchId, label: forkBranch?.branchName };
        // @ts-ignore
        setRuleBranchOptions(forkOption);
      } else {
        run({
          appId,
          sceneId,
        });
      }
    }
  }, [visible]);

  const onSubmit = async (values: any) => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在添加...', key: loadingKey, duration: 0 });
    let res;
    const params = {
      ...values,
      appId,
      sceneId,
    };
    if (!isExistMaster) {
      // init master
      res = await addMasterRuleBranch(params);
    } else if (params.srcBranchId) {
      // fork
      res = await cloneRuleBranch(params);
    } else {
      // add
      res = await addRuleBranch(params);
    }
    if (res.code !== 1) {
      message.error({ content: res.message, key: loadingKey, duration: 2 });
      return false;
    }
    message.success({ content: '添加成功!', key: loadingKey, duration: 2 });
    history.push(
      `/scene/rule/detail?id=${res.data.branchId}&app_id=${appId}&scene_id=${sceneId}&list_type=0&access_mode=0`,
    );
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

  const renderCreateBranchView = () => {
    return (
      <Spin spinning={loading}>
        <ProFormSelect
          rules={[
            {
              required: true,
            },
          ]}
          name="srcBranchId"
          label="源分支"
          placeholder="请输入分支名称"
          // showSearch
          options={ruleBranchOptions}
          fieldProps={{
            showArrow: true,
            filterOption: false,
            // onSearch: (value) => handleSearchBranch(value),
            onBlur: cancel,
            // loading: loading,
            // notFoundContent: loading ? <Spin size="small"/> : <Empty/>,
          }}
        />
        <ProFormText
          rules={[
            {
              required: true,
              message: '分支名称为必填项',
            },
          ]}
          name="branchName"
          label="分支名称"
        />
        <ProFormDigit
          rules={[
            {
              required: true,
              message: '优先级为必填项',
            },
          ]}
          initialValue={1}
          fieldProps={{ precision: 0 }}
          hidden={true}
          name="branchPriority"
          label="优先级"
        />
        <ProFormTextArea
          rules={[
            {
              required: true,
              message: '请输入描述',
            },
          ]}
          label="描述"
          name="branchDescription"
        />
      </Spin>
    );
  };

  return (
    <ModalForm
      title={title}
      visible={visible}
      modalProps={{
        forceRender: true,
      }}
      onVisibleChange={(visibleValue) => {
        form.resetFields();
        onVisibleChange(visibleValue);
      }}
      form={form}
      onFinish={onFinish}
    >
      {renderCreateBranchView()}
    </ModalForm>
  );
};

export default BranchModalForm;
