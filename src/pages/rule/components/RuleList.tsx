import React, { useState, useRef, useEffect } from 'react';
import { history, connect, Link } from 'umi';
import type { ConnectProps } from 'umi';
import type { ConnectState } from '@/models/connect';
import { Button, message, Popconfirm } from 'antd';
import { DiffOutlined, NodeIndexOutlined, PlusOutlined } from '@ant-design/icons';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import ProCard from '@ant-design/pro-card';
import type { BranchDetail } from '@/models/rule';
import { queryRuleBranch, queryPublishIndexList, queryRuleBranchOnline } from '@/services/rule';
import { submitPublishOrder } from '@/services/publish';
import { RuleBranchType } from '@/consts/const';
import { getPageQuery } from '@/utils/utils';
import BranchCreateModalForm from './ModalForm/BranchCreateModalForm';
import PublishIndexListModal from '@/pages/rule/components/Modal/PublishIndexListModal';
import CreatePublishResult from '@/pages/publish/components/Modal/CreatePublishResult';
import _ from 'lodash';

type RuleListProps = {
  listTabActiveKey?: string;
} & Partial<ConnectProps>;

const source = 1;

const RuleList: React.FC<RuleListProps> = (props) => {
  const { dispatch, listTabActiveKey } = props;

  const queryParams = getPageQuery();
  const appId = queryParams.app_id;
  const sceneId = queryParams.scene_id;

  const actionRef = useRef<ActionType>();
  // 创建/fork 分支
  const [createBranchModalVisible, handleCreateBranchModalVisible] = useState<boolean>(false);
  const [forkBranch, setForkBranch] = useState<BranchDetail>(Object.create(null));
  // 线上索引
  const [publishIndexModalVisible, handlePublishIndexModalVisible] = useState<boolean>(false);
  const [publishIndexData, setPublishIndexData] = useState(Object.create(null));
  // tableLoading
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  // 提交发布单反馈state
  const [createPublishResultModalVisible, setCreatePublishResultModalVisible] =
    useState<boolean>(false);
  const [apiResult, setApiResult] = useState(Object.create(null));

  const createPublishResultSwitch = (modalStatus: boolean, result: any) => {
    setApiResult(result);
    setCreatePublishResultModalVisible(true);
  };

  const loadPublishIndexData = async () => {
    const res = await queryPublishIndexList({
      appId,
      sceneId,
    });
    if (res && res.data && res.data.length > 0) {
      setPublishIndexData(res.data[0]);
    }
  };

  useEffect(() => {
    loadPublishIndexData();
  }, []);

  const createBranchModalStatusSwitch = (
    createBranchModalStatus: boolean,
    rowCurrentData?: any,
  ) => {
    handleCreateBranchModalVisible(createBranchModalStatus);
    setForkBranch(rowCurrentData);
  };

  const handlePublishRequest = async (branchId: number, branchType: number) => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在提交发布单成功...', key: loadingKey, duration: 0 });
    setTableLoading(true);
    const res = await submitPublishOrder({
      appId,
      sceneId,
      source,
      id: branchId,
      branchType,
    });
    setTableLoading(false);
    if (res.code !== 1) {
      message.destroy();
      createPublishResultSwitch(true, res);
      return false;
    }
    message.destroy();
    createPublishResultSwitch(true, res);
    return true;
  };

  const handleMergeRequest = async (branchId: number, branchType: number) => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在提交发布单...', key: loadingKey, duration: 0 });
    setTableLoading(true);
    const res = await submitPublishOrder({
      appId,
      sceneId,
      source,
      id: branchId,
      branchType,
      action: 3,
    });
    setTableLoading(false);
    if (res.code !== 1) {
      message.destroy();
      createPublishResultSwitch(true, res);
      return false;
    }
    message.destroy();
    createPublishResultSwitch(true, res);
    return true;
  };

  const handleStopRequest = async (branchId: number, branchType: number) => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在提交发布单...', key: loadingKey, duration: 0 });
    setTableLoading(true);
    const res = await submitPublishOrder({
      appId,
      sceneId,
      source,
      id: branchId,
      branchType,
      action: 2,
    });
    setTableLoading(false);
    if (res.code !== 1) {
      message.destroy();
      createPublishResultSwitch(true, res);
      return false;
    }
    message.destroy();
    createPublishResultSwitch(true, res);
    return true;
  };

  const renderBtn = (record: BranchDetail, listType: number = 0, accessMode: number = 0) => {
    const { branchId } = record;
    const edit = (
      <a
        key="edit"
        onClick={() => {
          history.push(
            accessMode === 0
              ? `/scene/rule/detail?id=${record.branchId}&app_id=${record.appId}&scene_id=${
                  record.sceneId
                }&list_type=${
                  record.publishStatus === 400 ? 1 : listType
                }&access_mode=${accessMode}`
              : `/scene/rule/detail?id=${record.branchId}&app_id=${record.appId}&scene_id=${
                  record.sceneId
                }&list_type=${
                  record.publishStatus === 400 ? 1 : listType
                }&access_mode=${accessMode}&version=${record.version}&base_version=${
                  record.baseVersion
                }`,
          );
        }}
      >
        详情
      </a>
    );
    const forkBtn = (
      <a
        key="forkBtn"
        onClick={() => {
          createBranchModalStatusSwitch(true, record);
        }}
      >
        fork
      </a>
    );
    const publishBtn = (
      <Popconfirm
        key="publishBtn"
        title="确认操作？"
        onConfirm={() => handlePublishRequest(branchId, record.branchType)}
      >
        <a>提交发布单</a>
      </Popconfirm>
    );
    const mergeBtn = (
      <Popconfirm
        key="mergeBtn"
        title="确认操作？"
        onConfirm={() => handleMergeRequest(branchId, record.branchType)}
      >
        <a>合并</a>
      </Popconfirm>
    );
    const stopBtn = (
      <Popconfirm
        key="stopBtn"
        title="确认操作？"
        onConfirm={() => handleStopRequest(branchId, record.branchType)}
      >
        <a>下线</a>
      </Popconfirm>
    );
    // if (record.branchType === 0) {
    //   return [edit];
    // }
    if (record.branchType === 1) {
      if (listType === 0) {
        return [edit, publishBtn];
      }
      return [edit, mergeBtn, stopBtn];
    }
    return [edit];
  };

  const devColumns: ProColumns<BranchDetail>[] = [
    {
      title: '分支名称',
      dataIndex: 'branchName',
    },
    {
      title: '分支类型',
      dataIndex: 'branchType',
      valueEnum: RuleBranchType,
    },
    {
      title: '当前版本',
      dataIndex: 'publishVersion',
      render: (dom, record) => {
        return `V${dom}`;
      },
    },
    {
      title: '执行顺序',
      dataIndex: 'branchPriority',
    },
    {
      title: '修改人',
      dataIndex: 'updateUser',
    },
    {
      title: '修改时间',
      dataIndex: 'updateTime',
      valueType: 'dateTime',
    },
    {
      title: '描述',
      dataIndex: 'branchDescription',
      ellipsis: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: '200px',
      render: (dom, record) => renderBtn(record, 0),
    },
  ];

  const onlineColumns: ProColumns<BranchDetail>[] = [
    {
      title: '分支名称',
      dataIndex: 'branchName',
    },
    {
      title: '分支类型',
      dataIndex: 'branchType',
      valueEnum: RuleBranchType,
    },
    {
      title: '发布版本',
      dataIndex: 'publishVersion',
      render: (dom, record) => {
        return `V${dom}`;
      },
    },
    {
      title: '执行顺序',
      dataIndex: 'branchPriority',
    },
    {
      title: '修改人',
      dataIndex: 'updateUser',
    },
    {
      title: '修改时间',
      dataIndex: 'updateTime',
      valueType: 'dateTime',
    },
    {
      title: '描述',
      dataIndex: 'branchDescription',
      ellipsis: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: '200px',
      render: (dom, record) => renderBtn(record, 1, 1),
    },
  ];

  const activeKeyList = ['tab1', 'tab2'];

  return (
    <div>
      <ProCard
        tabs={{
          type: 'card',
          animated: true,
          onChange: (activeKey) => {
            if (dispatch) {
              dispatch({
                type: 'rule/listTabEffect',
                payload: activeKey,
              });
            }
          },
          activeKey: listTabActiveKey || activeKeyList[0],
        }}
      >
        <ProCard.TabPane key={activeKeyList[0]} tab="开发视图">
          <ProTable<BranchDetail>
            headerTitle={
              <>
                分支列表(<span style={{ color: 'red' }}>红色的分支被修改，请谨慎使用</span>)
              </>
            }
            actionRef={actionRef}
            rowKey="branchId"
            search={false}
            options={false}
            loading={tableLoading}
            toolBarRender={() => [
              <Link
                className="ant-btn ant-btn-primary"
                to={`/scene/rule/diff?app_id=${appId}&scene_id=${sceneId}`}
                target="_blank"
              >
                <DiffOutlined /> 规则对比
              </Link>,
              <Button
                type="primary"
                key="primary"
                onClick={() => {
                  createBranchModalStatusSwitch(true, null);
                }}
              >
                <PlusOutlined /> 新建规则
              </Button>,
            ]}
            pagination={{
              pageSize: 10,
            }}
            params={{
              appId,
              sceneId,
            }}
            request={async (params: any) => {
              const { pageSize, current = 1, ...other } = params;
              setTableLoading(true);
              const result = await queryRuleBranch({
                pageIndex: current - 1,
                pageSize,
                appId,
                sceneId,
                ...other,
              });
              setTableLoading(false);
              return {
                data: result.datas,
                success: true,
                total: result.totalCount,
              };
            }}
            columns={devColumns}
            rowClassName={(record, index) => {
              return !_.isEmpty(record.upgradedInfo) ? 'table-color-red' : '';
            }}
          />
        </ProCard.TabPane>
        <ProCard.TabPane key={activeKeyList[1]} tab="线上视图">
          <ProTable<BranchDetail>
            headerTitle={
              <>
                分支列表(<span style={{ color: 'red' }}>红色的分支被修改，请谨慎使用</span>)
              </>
            }
            actionRef={actionRef}
            rowKey="branchId"
            search={false}
            options={false}
            loading={tableLoading}
            toolBarRender={() => [
              !_.isEmpty(publishIndexData) ? (
                <Button
                  type="primary"
                  key="primary"
                  style={{ marginRight: '5px' }}
                  onClick={() => {
                    handlePublishIndexModalVisible(true);
                  }}
                >
                  <NodeIndexOutlined /> 线上索引
                </Button>
              ) : (
                <></>
              ),
            ]}
            pagination={false}
            params={{
              appId,
              sceneId,
            }}
            request={async (params: any) => {
              const { pageSize, current = 1, ...other } = params;
              setTableLoading(true);
              const result = await queryRuleBranchOnline({
                appId,
                sceneId,
                pageIndex: current - 1,
                ...other,
              });
              setTableLoading(false);
              return {
                data: result.data,
                success: true,
                total: result.totalCount,
              };
            }}
            columns={onlineColumns}
            rowClassName={(record, index) => {
              return !_.isEmpty(record.upgradedInfo) ? 'table-color-red' : '';
            }}
          />
        </ProCard.TabPane>
      </ProCard>
      <PublishIndexListModal
        title={`线上索引`}
        visible={publishIndexModalVisible}
        onVisibleChange={handlePublishIndexModalVisible}
        currentData={publishIndexData}
      />
      <BranchCreateModalForm
        title={`新建规则`}
        actionRef={actionRef}
        visible={createBranchModalVisible}
        onVisibleChange={handleCreateBranchModalVisible}
        forkBranch={forkBranch}
      />
      <CreatePublishResult
        visible={createPublishResultModalVisible}
        onVisibleChange={setCreatePublishResultModalVisible}
        apiResult={apiResult}
      />
    </div>
  );
};

export default connect(({ rule }: ConnectState) => ({
  listTabActiveKey: rule.listTabActiveKey,
}))(RuleList);
