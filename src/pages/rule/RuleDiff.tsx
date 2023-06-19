import React, { useEffect, useState } from 'react';
import { useRequest } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Input, Button, message, Form, Spin, Empty } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import ProForm, { ProFormSelect } from '@ant-design/pro-form';
import ReactDiffViewer from 'react-diff-viewer';
import { branchDiffWith, queryRuleBranch } from '@/services/rule';
import type { BranchDetail, BranchDiffStruct } from '@/models/rule';
import { getPageQuery } from '@/utils/utils';
import './index.less';
import _ from 'lodash';

const RuleDiff: React.FC = () => {
  const [form] = Form.useForm();
  const queryParams = getPageQuery();
  const appId = queryParams.app_id;
  const sceneId = queryParams.scene_id;

  const [ruleBranchOptions, setRuleBranchOptions] = useState([]);
  const [branchDiff, setBranchDiff] = useState<BranchDiffStruct>(Object.create(null));
  const [disabledStatus, setDisabledStatus] = useState<boolean>(true);

  const initTargetBranchDefVal = (branch: BranchDetail) => {
    if (branch.branchType === 0) {
      form.setFieldsValue({
        targetBranchId: branch.branchId
      });
    }
  }

  const loadRuleBranchListData = async () => {
    const res = await queryRuleBranch({
      appId,
      sceneId,
      pageSize: 10,
      // ruleContentFlag: true,
    });
    if (res && res.datas && res.datas.length > 0) {
      const options = res.datas.map((item: BranchDetail) => {
        initTargetBranchDefVal(item);
        return {
          value: item.branchId,
          label: item.branchName,
        };
      });
      setRuleBranchOptions(options);
    }
  };

  useEffect(() => {
    loadRuleBranchListData();
  }, []);

  const { loading, run, cancel } = useRequest(queryRuleBranch, {
    debounceInterval: 500,
    manual: true,
    formatResult: (res) => {
      if (res && res.datas.length > 0) {
        const options = res.datas.map((item: BranchDetail) => {
          return {
            value: item.branchId,
            label: item.branchName,
          };
        });
        setRuleBranchOptions(options);
      }
    },
  });

  const handleSearchBranch = (value: string) => {
    if (_.isEmpty(value)) return;
    setRuleBranchOptions([]);
    run({
      appId,
      sceneId,
      branchName: value,
      ruleContentFlag: true,
    });
  };

  const handleDisabledStatus = () => {
    const status = !(form.getFieldValue('currentBranchId') && form.getFieldValue('targetBranchId'));
    setDisabledStatus(status);
  };

  const handleSwitchFromToValue = () => {
    if (disabledStatus) return;
    form.setFieldsValue({
      currentBranchId: form.getFieldValue('targetBranchId'),
      targetBranchId: form.getFieldValue('currentBranchId'),
    })
  };

  const onSubmit = async (values: any) => {
    setBranchDiff(Object.create(null));
    const res = await branchDiffWith({
      appId,
      sceneId,
      currentBranchId: values.currentBranchId,
      targetBranchId: values.targetBranchId,
    });
    if (res.code === 1) {
      setBranchDiff(res.data);
    } else {
      message.error('获取diff详情失败');
    }
  };

  const renderBranchDiff = () => {
    return (
      !_.isEmpty(branchDiff) && (
        <Card style={{ border: '1px solid #ccc', padding: '0px 20px 20px', marginTop: '20px' }}>
          <ReactDiffViewer
            leftTitle="当前内容"
            rightTitle="线上内容"
            oldValue={branchDiff?.currentContent || ''}
            newValue={branchDiff?.targetContent || ''}
            splitView={true}
          />
        </Card>
      )
    );
  };

  return (
    <PageContainer>
      <Card style={{ border: '1px solid #ccc', padding: '0px 20px 20px', marginTop: '20px' }}>
        <ProForm
          layout="inline"
          onFinish={onSubmit}
          submitter={{
            searchConfig: {
              submitText: '对比',
            },
            render: (props, dom) => dom.pop(),
            submitButtonProps: {
              disabled: disabledStatus,
            },
          }}
          form={form}
        >
          <ProForm.Group>
            <Input.Group>
              <Button
                icon={<SwapOutlined />}
                onClick={handleSwitchFromToValue}
                disabled={disabledStatus}
              />
            </Input.Group>
            <Input.Group>
              <span className="input-group-addon">from</span>
              <ProFormSelect
                width="sm"
                name="currentBranchId"
                showSearch
                options={ruleBranchOptions}
                fieldProps={{
                  showArrow: false,
                  allowClear: true,
                  filterOption: false,
                  onSearch: (value) => handleSearchBranch(value),
                  onBlur: cancel,
                  loading,
                  notFoundContent: loading ? <Spin size="small" /> : <Empty />,
                  onSelect: handleDisabledStatus,
                }}
              />
            </Input.Group>
            <Input.Group>
              <span className="input-group-addon">to</span>
              <ProFormSelect
                width="sm"
                name="targetBranchId"
                showSearch
                options={ruleBranchOptions}
                fieldProps={{
                  showArrow: false,
                  allowClear: true,
                  filterOption: false,
                  onSearch: (value) => handleSearchBranch(value),
                  onBlur: cancel,
                  loading,
                  notFoundContent: loading ? <Spin size="small" /> : <Empty />,
                  onSelect: handleDisabledStatus,
                }}
              />
            </Input.Group>
          </ProForm.Group>
        </ProForm>
      </Card>
      {renderBranchDiff()}
    </PageContainer>
  );
};

export default RuleDiff;
