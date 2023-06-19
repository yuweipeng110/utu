import React, { useState, useRef } from 'react';
import { history } from 'umi';
import { message, Drawer, Popconfirm } from 'antd';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import ProDescriptions from '@ant-design/pro-descriptions';
import type { BranchDetail } from '@/models/rule';
import { queryRuleBranch, deleteRuleBranch } from '@/services/rule';
import { RuleBranchState, RuleBranchType } from '@/consts/const';
import { getPageQuery } from '@/utils/utils';

const RuleList: React.FC = () => {
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<BranchDetail>();
  const actionRef = useRef<ActionType>();

  const queryParams = getPageQuery();
  const appId = queryParams.app_id;
  const sceneId = queryParams.scene_id;

  const renderBtn = (record: BranchDetail) => {
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
            `/scene/archive/update?id=${record.branchId}&app_id=${record.appId}&scene_id=${record.sceneId}`,
          );
        }}
      >
        详情
      </a>
    );
    const deleteBtn = (
      <Popconfirm
        title="确定要删除吗？"
        key="2"
        onConfirm={async () => {
          const res = await deleteRuleBranch({ branchId: record.branchId });
          if (res.code === 1) {
            message.success('删除成功');
            actionRef.current?.reload();
          } else {
            message.error('删除失败');
          }
        }}
      >
        <a key="delete">删除</a>
      </Popconfirm>
    );

    switch (record.branchStatus) {
      case 200:
        return [edit, deleteBtn];
      default:
        return [edit];
    }
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
      title: '归档人',
      dataIndex: 'archiveUser',
    },
    {
      title: '归档时间',
      dataIndex: 'archiveTime',
      valueType: 'dateTime',
    },
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
      render: (_, record: BranchDetail) => renderBtn(record),
    },
  ];

  return (
    <div>
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
            currentStep: 2,
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

export default RuleList;
