import React, { useState } from 'react';
import { history } from 'umi';
import { Card, Button, Space, Popconfirm, message } from 'antd';
import ProForm, { ProFormTextArea } from '@ant-design/pro-form';
import ProTable, { ProColumns } from '@ant-design/pro-table';
import ProCard from '@ant-design/pro-card';
import { StrategyDeployInfo } from '@/models/strategyDeploy';
import type { AppDeployDiffInfo } from '@/models/appDeploy';
import { appDeployStageHandler, rollbackDiffPreview } from '@/services/appDeploy';
import { StrategyDeployAction } from '@/consts/strategyDeploy/const';
import { getPageQuery } from '@/utils/utils';
import ViewCode from '@/components/Modal/ViewCode';
import _ from 'lodash';

export type RollbackStrategyDeployStep10Props = {
  setLoading: any;
  currentAppDeployData?: StrategyDeployInfo;
  createAppDeployResultSwitch?: any;
  informationParams?: any;
  setRandom?: any;
  closeAppDeployRequest?: any;
  stagePrevious?: any;
  stageNext?: any;
  onRefresh: any;
};

const RollbackStrategyDeployStep10: React.FC<RollbackStrategyDeployStep10Props> = (props) => {
  const {
    setLoading,
    currentAppDeployData,
    createAppDeployResultSwitch,
    setRandom,
    informationParams,
    closeAppDeployRequest,
    stagePrevious,
    stageNext,
    onRefresh,
  } = props;
  const queryParams = getPageQuery();
  const appId = queryParams['app_id'];

  const [viewDeployCodeModalVisible, handleViewDeployCodeModalVisible] = useState<boolean>(false);
  const [previewSourceCode, setPreviewSourceCode] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);

  const viewDeployModalStatusSwitch = async (viewDeployModalStatus: boolean) => {
    handleViewDeployCodeModalVisible(viewDeployModalStatus);
    setPreviewLoading(true);
    const res = await rollbackDiffPreview({
      orderId: currentAppDeployData?.orderId,
    });
    setPreviewLoading(false);
    if (res.code !== 1) {
      handleViewDeployCodeModalVisible(false);
      return false;
    }
    setPreviewSourceCode(res.data);
    return true;
  };

  const columns: ProColumns<Partial<AppDeployDiffInfo>>[] = [
    {
      title: '变更名称',
      dataIndex: 'packageName',
    },
    {
      title: '变更版本',
      dataIndex: 'contentVersion',
      render: (dom, record) => {
        if (record.action === 2) {
          return (
            <>
              V{record.originalVersion} -&gt; V{dom}
            </>
          );
        }
        return <>V{dom}</>;
      },
    },
    {
      title: '变更类型',
      dataIndex: 'action',
      valueEnum: StrategyDeployAction,
      render: (dom, record) => {
        let colorVal: string = '';
        switch (record.action) {
          case 0:
            colorVal = '';
            break;
          case 1:
            colorVal = 'green';
            break;
          case 2:
            colorVal = 'blue';
            break;
          case 3:
            colorVal = 'red';
            break;
        }
        return <span style={{ color: colorVal }}>{dom}</span>;
      },
    },
    {
      title: '操作',
      align: 'center',
      valueType: 'option',
      render: (dom, record) => {
        const diffBtn = (
          <a
            key="diffBtn"
            href={`#/app/strategyDeploy/diffPackageVersion?package_name=${record.packageName}&content_id=${record.contentId}&original_content_id=${record.originalContentId}`}
            target="_blank"
          >
            点击查看diff
          </a>
        );
        // 变更状态显示diff按钮
        if (record.action === 2) {
          return diffBtn;
        }
        return null;
      },
    },
  ];

  const onSubmit = async (values: any) => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在提交...', key: loadingKey, duration: 0 });
    const params = {
      ...values,
      appId,
      stage: currentAppDeployData?.stage,
      orderId: Number(currentAppDeployData?.orderId),
    };
    setLoading(true);
    const res = await appDeployStageHandler(params);
    setLoading(false);
    if (res.code !== 1) {
      // message.error({ content: res.message, key: loadingKey, duration: 2 });
      message.destroy();
      createAppDeployResultSwitch(true, res);
      return false;
    }
    message.success({ content: '提交成功! ', key: loadingKey, duration: 2 });
    // refreshCurrent();
    // history.push(`/app/strategyDeploy/rollback?app_id=${appId}&id=${res.data}`);
    await onRefresh(null, currentAppDeployData?.stage);
    return true;
  };

  const onFinish = async (values: any) => {
    const success = await onSubmit(values);
    if (!success) {
      return false;
    }
    return true;
  };

  return (
    <>
      <Card
        title="包diff"
        extra={
          <Space size="large">
            {currentAppDeployData?.originalStage === 200 && (
              <Popconfirm title="确认操作？" onConfirm={closeAppDeployRequest}>
                <Button type="primary">关闭</Button>
              </Popconfirm>
            )}
            <Button type="primary" onClick={() => viewDeployModalStatusSwitch(true)}>
              预览
            </Button>
          </Space>
        }
      >
        <ProForm
          onFinish={onFinish}
          submitter={{
            render: (props) => {
              if (!_.isEmpty(currentAppDeployData) && currentAppDeployData?.originalStage === 200) {
                return (
                  <div style={{ textAlign: 'center' }}>
                    <Space size="large">
                      <Button type="primary" key="submit" onClick={() => props.form?.submit?.()}>
                        下一步
                      </Button>
                    </Space>
                  </div>
                );
              }
              return null;
            },
          }}
          initialValues={currentAppDeployData}
        >
          <Space size="large" direction="vertical" style={{ width: '100%' }}>
            {informationParams.map((item: any) => {
              return (
                <>
                  <ProCard
                    title={item.sceneName}
                    headerBordered
                    collapsible
                    defaultCollapsed={false}
                    size="small"
                  >
                    <ProTable<Partial<AppDeployDiffInfo>>
                      rowKey="index"
                      columns={columns}
                      dataSource={item.params}
                      pagination={false}
                      options={false}
                      search={false}
                      size="small"
                    />
                  </ProCard>
                </>
              );
            })}
            <ProFormTextArea
              name="deployRemark"
              label="备注"
              placeholder="请输入备注"
              rules={[
                {
                  required: true,
                },
              ]}
              disabled={
                !_.isEmpty(currentAppDeployData) && currentAppDeployData?.originalStage !== 200
              }
            />
          </Space>
        </ProForm>
      </Card>
      <ViewCode
        visible={viewDeployCodeModalVisible}
        onVisibleChange={handleViewDeployCodeModalVisible}
        sourceCode={previewSourceCode}
        previewLoading={previewLoading}
      />
    </>
  );
};

export default RollbackStrategyDeployStep10;
