import React from 'react';
import { Modal } from 'antd';
import type { PublishIndex } from '@/models/rule';
import '../../index.less';
import ProTable, { ProColumns } from "@ant-design/pro-table";
import { BranchDetail } from "@/models/rule";
import { queryRuleBranchOnline } from "@/services/rule";

type branchHistoryListProps = {
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  currentData: PublishIndex;
};

const BranchHistoryList: React.FC<branchHistoryListProps> = (props) => {
  const { visible, onVisibleChange, currentData } = props;

  const columns: ProColumns<BranchHistory>[] = [
    {
      title: 'id',
      dataIndex: 'version',
    },
    {
      title: '版本号',
      dataIndex: 'version',
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
  ];

  return (
    <Modal
      title="历史版本"
      visible={visible}
      width="70%"
      centered={true}
      onCancel={() => {
        onVisibleChange(false);
      }}
      footer={false}
    >
      <ProTable<BranchDetail>
        headerTitle={false}
        rowKey="branchId"
        search={false}
        options={false}
        pagination={false}
        request={async (params: any) => {
          const { pageSize, current = 1, ...other } = params;
          const result = await queryRuleBranchOnline({
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
    </Modal>
  );
};

export default BranchHistoryList;
