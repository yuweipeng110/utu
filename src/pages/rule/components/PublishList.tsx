import { Button, Drawer } from 'antd';
import React, { useState, useRef, useEffect } from 'react';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import { history, connect, Link } from 'umi';
import type { ConnectState } from '@/models/connect';
import ProDescriptions from '@ant-design/pro-descriptions';
import type { BranchDetail } from '@/models/rule';
import { queryPublishIndexList, queryRuleBranch } from '@/services/rule';
import { getPageQuery } from '@/utils/utils';
import { RuleBranchState, RuleBranchType, RunType, PublishAction } from '@/consts/const';
import PublishIndexListModal from '@/pages/rule/components/Modal/PublishIndexListModal';
import BranchCreateModalForm from '@/pages/rule/components/ModalForm/BranchCreateModalForm';
import '../index.less';
import _ from 'lodash';

const PublishList: React.FC = () => {
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<BranchDetail>();
  const [publishIndexModalVisible, handlePublishIndexModalVisible] = useState<boolean>(false);
  const [publishIndexData, setPublishIndexData] = useState(Object.create(null));
  const [createBranchModalVisible, handleCreateBranchModalVisible] = useState<boolean>(false);
  const [forkBranch, setForkBranch] = useState<BranchDetail>(Object.create(null));

  const actionRef = useRef<ActionType>();
  const queryParams = getPageQuery();
  const appId = queryParams.app_id;
  const sceneId = queryParams.scene_id;

  const createBranchModalStatusSwitch = (
    createBranchModalStatus: boolean,
    rowCurrentData?: any,
  ) => {
    handleCreateBranchModalVisible(createBranchModalStatus);
    setForkBranch(rowCurrentData);
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

  const renderBtn = (record: BranchDetail) => {
    const masterView = (
      <a
        key="view"
        onClick={() => {
          history.push(
            `/scene/publish/master?id=${record.branchId}&app_id=${record.appId}&scene_id=${record.sceneId}`,
          );
        }}
      >
        详情
      </a>
    );
    const fork = (
      <a
        key="view"
        onClick={() => {
          createBranchModalStatusSwitch(true, record);
        }}
      >
        fork
      </a>
    );
    /*  const clone = (
      <a
        key="copy"
        onClick={() => {
          history.push(`/updateRule?id=${record.branchId}?copy=1`);
        }}
      >
        复制
      </a>
    );  */

    const edit = (
      <a
        key="edit"
        onClick={() => {
          history.push(
            `/scene/publish/update?id=${record.branchId}&app_id=${record.appId}&scene_id=${record.sceneId}`,
          );
        }}
      >
        详情
      </a>
    );

    if (record.branchType === 0 && record.publishState === 2) {
      return [masterView, fork];
    }

    return [edit, fork];
  };

  const columns: ProColumns<BranchDetail>[] = [
    {
      title: 'ID',
      dataIndex: 'branchId',
      search: false,
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              setShowDetail(true);
            }}
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: '分支名称',
      dataIndex: 'branchName',
    },
    {
      title: '分支类型',
      dataIndex: 'branchType',
      search: false,
      valueEnum: RuleBranchType,
    },
    {
      title: '当前阶段',
      dataIndex: 'branchStatus',
      valueEnum: RuleBranchState,
    },
    {
      title: '发布状态',
      dataIndex: 'publishState',
      valueEnum: PublishAction,
    },
    {
      title: '运行模式',
      dataIndex: 'runType',
      valueEnum: RunType,
    },
    {
      title: '发布人',
      dataIndex: 'publishUser',
      search: false,
    },
    {
      title: '发布时间',
      dataIndex: 'publishTime',
      search: false,
      valueType: 'dateTime',
    },
    {
      title: '执行顺序',
      dataIndex: 'branchPriority',
      search: false,
    },
    // {
    //   title: '发布条件',
    //   dataIndex: 'branchPriority',
    //   search: false,
    // },
    {
      title: '描述',
      dataIndex: 'branchDescription',
      search: false,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: '200px',
      render: (text, record: BranchDetail) => renderBtn(record),
    },
  ];

  return (
    <div>
      <div className="publish-content">
        {!_.isEmpty(publishIndexData) && (
          <Button
            type="primary"
            key="primary"
            style={{ marginRight: '5px' }}
            onClick={() => {
              handlePublishIndexModalVisible(true);
            }}
          >
            线上索引
          </Button>
        )}
        <Link
          className="ant-btn ant-btn-primary"
          to={`/scene/publish/diff?app_id=${appId}&scene_id=${sceneId}`}
          target="_blank"
        >
          规则对比
        </Link>
      </div>
      <ProTable<BranchDetail>
        headerTitle={'规则列表'}
        actionRef={actionRef}
        rowKey="branchId"
        search={false}
        pagination={{
          pageSize: 10,
        }}
        options={false}
        request={async (params) => {
          const { pageSize, current = 1, ...other } = params;
          const result = await queryRuleBranch({
            appId,
            sceneId,
            pageIndex: current - 1,
            pageSize,
            currentStep: 1,
            ...other,
          });
          return {
            data: result.datas,
            success: true,
            total: result.totalCount,
          };
        }}
        columns={columns}
      />
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
      <Drawer
        width={700}
        visible={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.branchName && (
          <ProDescriptions<BranchDetail>
            column={2}
            title={currentRow?.branchName}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.branchName,
            }}
            columns={columns as ProDescriptionsItemProps<BranchDetail>[]}
          />
        )}
      </Drawer>
    </div>
  );
};

export default connect(({ app }: ConnectState) => ({
  currentScene: app.currentScene,
}))(PublishList);
