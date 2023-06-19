import React, { useEffect, useRef, useState } from 'react';
import { connect, history } from 'umi';
import type { ConnectProps } from 'umi';
import type { ConnectState } from '@/models/connect';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Dropdown, Menu, message, Tag } from 'antd';
import { DownOutlined, PlusOutlined } from '@ant-design/icons';
import type { AppInfo } from '@/models/app';
import { StrategyInfo } from '@/models/strategy';
import {
  disableJobOfflineStrategy,
  enableJobOfflineStrategy,
  execJobOfflineStrategy,
  queryOfflineStrategyList,
} from '@/services/offlineStrategy';
import { OfflineStrategyType } from '@/consts/offlineStrategy/const';
import _ from 'lodash';
import './index.less';

export type OfflineStrategyListProps = {
  currentApp?: AppInfo;
} & Partial<ConnectProps>;

const OfflineStrategyList: React.FC<OfflineStrategyListProps> = (props) => {
  const { currentApp } = props;
  const actionRef = useRef<ActionType>();

  const [tableLoading, setTableLoading] = useState<boolean>(false);

  useEffect(() => {
    actionRef.current?.reload();
  }, [currentApp]);

  const execJobRequest = async (record: StrategyInfo) => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在执行...', key: loadingKey, duration: 0 });
    setTableLoading(true);
    const res = await execJobOfflineStrategy({
      appId: Number(currentApp?.id),
      id: record.id,
      jobId: record.jobId,
      stableVersion: record.stableVersion,
    });
    setTableLoading(false);
    if (res.code !== 1) {
      message.error({ content: res.message, key: loadingKey, duration: 2 });
      return false;
    }
    message.success({ content: '执行成功', key: loadingKey, duration: 2 });
    actionRef.current?.reload();
    return true;
  };

  const disableJobRequest = async (record: StrategyInfo) => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在禁用...', key: loadingKey, duration: 0 });
    setTableLoading(true);
    const res = await disableJobOfflineStrategy({
      appId: Number(currentApp?.id),
      id: record.id,
      jobId: record.jobId,
      stableVersion: record.stableVersion,
    });
    setTableLoading(false);
    if (res.code !== 1) {
      message.error({ content: res.message, key: loadingKey, duration: 2 });
      return false;
    }
    message.success({ content: '禁用成功', key: loadingKey, duration: 2 });
    actionRef.current?.reload();
    return true;
  };

  const enableJobRequest = async (record: StrategyInfo) => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在启用...', key: loadingKey, duration: 0 });
    setTableLoading(true);
    const res = await enableJobOfflineStrategy({
      appId: Number(currentApp?.id),
      id: record.id,
      jobId: record.jobId,
      stableVersion: record.stableVersion,
    });
    setTableLoading(false);
    if (res.code !== 1) {
      message.error({ content: res.message, key: loadingKey, duration: 2 });
      return false;
    }
    message.success({ content: '启用成功', key: loadingKey, duration: 2 });
    actionRef.current?.reload();
    return true;
  };

  const renderBtn = (record: StrategyInfo) => {
    const editBtn = (
      <a
        key="editBtn"
        onClick={() => {
          history.push(
            `/knowledge/offlineStrategy/update?id=${record.id}&app_id=${currentApp?.id}`,
          );
        }}
      >
        编辑
      </a>
    );

    const detailBtn = (
      <a
        key="detailBtn"
        onClick={() => {
          history.push(`/knowledge/offlineStrategy/detail?id=${record.id}`);
        }}
      >
        详情
      </a>
    );

    const executorRecordBtn = (
      <a
        key="executorRecordBtn"
        onClick={() => {
          history.push(`/knowledge/offlineStrategy/job?id=${record.id}&job_id=${record.jobId}`);
        }}
      >
        执行记录
      </a>
    );

    const strategyRunCountBtn = (
      <a
        key="strategyRunCountBtn"
        onClick={() => {
          history.push(`/knowledge/offlineStrategy/runCount?strategy_id=${record.id}`);
        }}
      >
        运行统计
      </a>
    );

    const executeBtn = (
      <a
        key="executeBtn"
        onClick={() => {
          execJobRequest(record);
        }}
      >
        运行一次
      </a>
    );
    const disableBtn = (
      <a
        key="disableBtn"
        onClick={() => {
          disableJobRequest(record);
        }}
      >
        禁用
      </a>
    );
    const enableBtn = (
      <a
        key="enableBtn"
        onClick={() => {
          enableJobRequest(record);
        }}
      >
        启用
      </a>
    );

    const moreMenu = (
      <Menu>
        <Menu.Item>{strategyRunCountBtn}</Menu.Item>
        <Menu.Item>{executeBtn}</Menu.Item>
        <Menu.Item>{record.status === 0 ? disableBtn : enableBtn}</Menu.Item>
      </Menu>
    );

    const moreBtn = (
      <Dropdown key="moreBtn" overlay={moreMenu}>
        <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
          操作 <DownOutlined />
        </a>
      </Dropdown>
    );

    if (record.jobId !== null) {
      return [editBtn, detailBtn, moreBtn];
    }
    return [editBtn, detailBtn];
  };

  const columns: ProColumns<StrategyInfo>[] = [
    {
      title: '策略名称',
      dataIndex: 'name',
      render: (dom, record) => {
        if (record.status < 0) {
          return dom;
        }
        if (record.status === 0) {
          return (
            <>
              <Tag color="#87d068">启用</Tag>
              {dom}
            </>
          );
        }
        return (
          <>
            <Tag color="#A8A4A3">禁用</Tag>
            {dom}
          </>
        );
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
    },
    {
      title: '类型',
      dataIndex: 'type',
      valueEnum: OfflineStrategyType,
      hideInSearch: true,
    },
    {
      title: '最新版本',
      dataIndex: 'stableVersion',
      hideInSearch: true,
      render: (dom, record) => {
        let domTitle = record.stableVersion === 0 ? '初始版本' : dom;
        return !_.isEmpty(record.upgradedFeature) ? (
          <span style={{ color: 'red' }}>{domTitle}</span>
        ) : (
          <span style={{ color: 'green' }}>{domTitle}</span>
        );
      },
    },
    {
      title: '修改人',
      dataIndex: 'updateUser',
      hideInSearch: true,
    },
    {
      title: '修改时间',
      dataIndex: 'updateTime',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: '200px',
      render: (value, record) => renderBtn(record),
    },
  ];

  return (
    <PageContainer>
      <ProTable<StrategyInfo>
        headerTitle={<>离线策略列表</>}
        actionRef={actionRef}
        rowKey="id"
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              history.push(`/knowledge/offlineStrategy/update?app_id=${currentApp?.id}`);
            }}
          >
            <PlusOutlined /> 新建离线策略
          </Button>,
        ]}
        options={false}
        loading={tableLoading}
        request={async (params) => {
          const { pageSize, current = 1, ...other } = params;
          setTableLoading(true);
          const result = await queryOfflineStrategyList({
            pageIndex: current - 1,
            pageSize,
            appId: currentApp && currentApp.id,
            ...other,
          });
          setTableLoading(false);
          return {
            data: result.datas,
            success: true,
            total: result.totalCount,
          };
        }}
        pagination={{
          pageSize: 10,
        }}
        columns={columns}
      />
    </PageContainer>
  );
};

export default connect(({ app }: ConnectState) => ({
  currentApp: app.currentApp,
}))(OfflineStrategyList);
