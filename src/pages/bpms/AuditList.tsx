import React, { useRef } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { BPMSItem } from '@/models/bpms';
import { queryListBPMS } from '@/services/bpms';
import { RuleBranchState, ApprovalFlowState } from '@/consts/const';
import { getPageQuery } from '@/utils/utils';

const AuditList: React.FC = () => {
  const actionRef = useRef<ActionType>();

  const queryParams = getPageQuery();
  const appId = queryParams.app_id;
  const sceneId = queryParams.scene_id;

  const renderBtn = (record: BPMSItem) => {
    const detail = (
      <a key="detail" href={record.flowUrl} target="blank">
        详情
      </a>
    );
    switch (record.flowStatus) {
      default:
        return [detail];
    }
  };

  const columns: ProColumns<BPMSItem>[] = [
    {
      title: 'ID',
      dataIndex: 'flowId',
    },
    {
      title: '规则分支ID',
      dataIndex: 'ruleBranchId',
    },

    {
      title: '状态',
      dataIndex: 'ruleBranchStatus',
      valueEnum: RuleBranchState,
    },
    {
      title: '发布人',
      dataIndex: 'createUser',
    },
    {
      title: '发布时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
    },
    {
      title: '审批状态',
      dataIndex: 'flowStatus',
      valueEnum: ApprovalFlowState,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: '200px',
      render: (_, record: BPMSItem) => renderBtn(record),
    },
  ];

  return (
    <PageContainer>
      <ProTable<BPMSItem>
        headerTitle="审批列表"
        actionRef={actionRef}
        rowKey="flowId"
        search={false}
        options={false}
        request={async (params) => {
          const { pageSize, current = 1, ...other } = params;
          const result = await queryListBPMS({
            appId,
            sceneId,
            pageIndex: current - 1,
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
    </PageContainer>
  );
};

export default AuditList;
