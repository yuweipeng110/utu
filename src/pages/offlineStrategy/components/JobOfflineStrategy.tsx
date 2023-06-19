import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Tag } from 'antd';
import ProCard from '@ant-design/pro-card';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { getOfflineJobInstanceDetail } from '@/services/offlineStrategy';
import ProTable, { ProColumns } from '@ant-design/pro-table';
import { OfflineStrategyJobStatusType } from '@/consts/offlineStrategy/const';
import { OfflineStrategyJob } from '@/models/offlineStrategy';

type JobOfflineStrategyProps = {
  location: { query: any };
};
const JobOfflineStrategy: React.FC<JobOfflineStrategyProps> = (props) => {
  const {
    location: { query },
  } = props;
  const jobId = query.job_id;

  const columns: ProColumns<OfflineStrategyJob>[] = [
    {
      title: '策略名称',
      dataIndex: 'strategyName',
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueEnum: OfflineStrategyJobStatusType,
      render: (dom, record) => {
        let domTag;
        switch (record.status) {
          case 1:
            domTag = (
              <Tag icon={<ExclamationCircleOutlined />} color="warning">
                {dom}
              </Tag>
            );
            break;
          case 3:
            domTag = (
              <Tag icon={<SyncOutlined spin />} color="processing">
                {dom}
              </Tag>
            );
            break;
          case 4:
            domTag = (
              <Tag icon={<CheckCircleOutlined />} color="success">
                {dom}
              </Tag>
            );
            break;
          case 5:
            domTag = (
              <Tag icon={<CloseCircleOutlined />} color="error">
                {dom}
              </Tag>
            );
            break;
          case 9:
            domTag = (
              <Tag icon={<ClockCircleOutlined />} color="default">
                {dom}
              </Tag>
            );
            break;
        }
        return domTag;
      },
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      valueType: 'dateTime',
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      valueType: 'dateTime',
    },
    {
      title: '执行人',
      dataIndex: 'executor',
    },
    {
      title: '执行结果',
      dataIndex: 'result',
      ellipsis: true,
    },
  ];

  return (
    <PageContainer>
      <ProCard title="执行记录" headerBordered>
        <ProTable<OfflineStrategyJob>
          headerTitle="执行记录列表"
          rowKey="startTime"
          options={false}
          search={false}
          request={async () => {
            const result = await getOfflineJobInstanceDetail({
              jobId: Number(jobId),
            });
            return {
              data: result.data.jobInstanceDetailList,
              success: true,
              // total: result.totalCount,
            };
          }}
          pagination={false}
          columns={columns}
        />
      </ProCard>
    </PageContainer>
  );
};

export default JobOfflineStrategy;
