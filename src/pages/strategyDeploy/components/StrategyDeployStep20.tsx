import React, { useState } from 'react';
import { Button, Space, message, Popconfirm, Row, Col, Modal } from 'antd';
import ProForm from '@ant-design/pro-form';
import ProTable, { ProColumns } from '@ant-design/pro-table';
import ProCard from '@ant-design/pro-card';
import type { StrategyDeployInfo, StrategyDeployDiffInfo } from '@/models/strategyDeploy';
import type { StrategyInfo } from '@/models/strategy';
import { appDeployStageHandler } from '@/services/appDeploy';
import { StrategyDeployAction } from '@/consts/strategyDeploy/const';
import { getPageQuery } from '@/utils/utils';
import DiffDecisionFlowModal from './Modal/DiffDecisionFlow';
import _ from 'lodash';

export type StrategyDeployStep20Props = {
  setLoading: any;
  currentAppDeployData?: StrategyDeployInfo;
  setRandom?: any;
  informationParams?: any;
  closeAppDeployRequest?: any;
  stagePrevious?: any;
  stageNext?: any;
  onRefresh?: any;
};

const StrategyDeployStep20: React.FC<StrategyDeployStep20Props> = (props) => {
  const {
    setLoading,
    currentAppDeployData,
    setRandom,
    informationParams,
    closeAppDeployRequest,
    stagePrevious,
    stageNext,
    onRefresh,
  } = props;
  const queryParams = getPageQuery();
  const appDeployId = queryParams['id'];
  const appId = queryParams['app_id'];

  const [currentDiffFlowData, setCurrentDiffFlowData] = useState(Object.create(null));
  const [diffFlowModalVisible, setDiffFlowModalVisible] = useState<boolean>(false);

  const diffFlowModalStatusSwitch = async (modalStatus: boolean, rowCurrentData: any) => {
    setDiffFlowModalVisible(true);
    setCurrentDiffFlowData(rowCurrentData);
  };

  const columns: ProColumns<Partial<StrategyDeployDiffInfo>>[] = [
    {
      title: '变更包名称',
      dataIndex: 'packageName',
    },
    {
      title: '变更包版本',
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
      title: '变更包类型',
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
          return [diffBtn];
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
      orderId: Number(appDeployId),
      isBpms: 1,
    };
    setLoading(true);
    const res = await appDeployStageHandler(params);
    setLoading(false);
    if (res.code !== 1) {
      message.error({ content: res.message, key: loadingKey, duration: 2 });
      return false;
    }
    message.success({ content: '提交成功! ', key: loadingKey, duration: 2 });
    // refreshCurrent();
    // history.push(`/app/deploy/update?id=${res.orderId}`);
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

  const expandedRowRender = (record: Partial<StrategyDeployDiffInfo>) => {
    const ruleBranchColumns: ProColumns<StrategyInfo>[] = [
      { title: '策略名称', dataIndex: 'name' },
      { title: '描述', dataIndex: 'description' },
      { title: '版本', dataIndex: 'stableVersion', render: (dom, record) => <>V{dom}</> },
      {
        title: '操作',
        align: 'center',
        valueType: 'option',
        render: (dom, record) => {
          const detailBtn = (
            <a
              key="detailBtn"
              href={`/#/knowledge/strategy/detail?app_id=${appId}&id=${record.strategyId}&version=${record.stableVersion}`}
              target="_blank"
            >
              详情
            </a>
          );
          return [detailBtn];
        },
      },
    ];

    const flowDiffColumns: ProColumns<any>[] = [
      { title: '决策流名称', dataIndex: 'name' },
      { title: '描述', dataIndex: 'description' },
      {
        title: '变更决策流版本',
        dataIndex: 'version',
        render: (dom, record) => {
          if (record.type === 2) {
            return (
              <>
                V{record.originalVersion} -&gt; V{record.version}
              </>
            );
          }
          return <>V{dom}</>;
        },
      },
      {
        title: '变更决策流类型',
        dataIndex: 'type',
        valueEnum: StrategyDeployAction,
        render: (dom, record) => {
          let colorVal: string = '';
          switch (record.type) {
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
              onClick={() => {
                diffFlowModalStatusSwitch(true, record);
              }}
            >
              点击查看diff
            </a>
          );
          // // 变更状态显示diff按钮
          // if (record.type === 2) {
          //   return [diffBtn];
          // }
          // return [diffBtn];
          return [];
        },
      },
    ];

    return (
      <>
        {!_.isEmpty(record.originalStrategyList) && !_.isEmpty(record.strategyList) && (
          <Row>
            <Col span={12}>
              <ProCard title="老版包" headerBordered>
                <ProTable<StrategyInfo>
                  headerTitle={false}
                  rowKey="strategyId"
                  className="my-edit-pro-table"
                  bordered
                  columns={ruleBranchColumns}
                  dataSource={record.originalStrategyList}
                  pagination={false}
                  options={false}
                  search={false}
                />
              </ProCard>
            </Col>
            <Col span={12}>
              <ProCard title="新版包" headerBordered>
                <ProTable<StrategyInfo>
                  headerTitle={false}
                  rowKey="strategyId"
                  className="my-edit-pro-table"
                  bordered
                  columns={ruleBranchColumns}
                  dataSource={record.strategyList}
                  pagination={false}
                  options={false}
                  search={false}
                />
              </ProCard>
            </Col>
          </Row>
        )}
        {!_.isEmpty(record.flowDiffList) && (
          <>
            <ProCard title="决策流列表" headerBordered>
              <ProTable<StrategyInfo>
                headerTitle={false}
                rowKey="name"
                className="my-edit-pro-table"
                bordered
                columns={flowDiffColumns}
                dataSource={record.flowDiffList}
                pagination={false}
                options={false}
                search={false}
              />
            </ProCard>
            <DiffDecisionFlowModal
              visible={diffFlowModalVisible}
              onVisibleChange={setDiffFlowModalVisible}
              currentData={currentDiffFlowData}
            />
          </>
        )}
      </>
    );
  };

  return (
    <ProCard
      title="包diff"
      headerBordered
      extra={
        currentAppDeployData?.originalStage === 200 && (
          <Popconfirm title="确认操作？" onConfirm={closeAppDeployRequest}>
            <Button type="primary">关闭</Button>
          </Popconfirm>
        )
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
                    <Button
                      type="primary"
                      key="submit"
                      onClick={() => stagePrevious(currentAppDeployData.stage)}
                    >
                      上一步
                    </Button>
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
      >
        {informationParams.map((item: any, index: number) => {
          return (
            <div key={index}>
              <ProCard
                title={
                  <>
                    场景{index + 1}：{item.sceneName}&nbsp;
                    {item.changeStrategyPackageCount !== null &&
                      item.changeStrategyPackageCount > 0 && (
                        <span style={{ color: 'red' }}>
                          (此次发布变更了{item?.changeStrategyPackageCount}个包，
                          {item?.changeStrategyCount}个策略)
                        </span>
                      )}
                  </>
                }
                headerBordered
                collapsible
                defaultCollapsed={false}
                size="small"
              >
                <ProTable<Partial<StrategyDeployDiffInfo>>
                  rowKey="packageId"
                  columns={columns}
                  dataSource={item.params}
                  pagination={false}
                  options={false}
                  search={false}
                  size="small"
                  expandable={{
                    expandedRowRender: (record) => expandedRowRender(record),
                    rowExpandable: (record) =>
                      record.originalStrategyList !== null &&
                      record.strategyList !== null &&
                      record.flowDiffList !== null,
                  }}
                />
              </ProCard>
            </div>
          );
        })}
      </ProForm>
    </ProCard>
  );
};

export default StrategyDeployStep20;
