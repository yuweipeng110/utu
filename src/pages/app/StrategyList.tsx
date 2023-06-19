import React, { useEffect, useRef, useState } from 'react';
import { connect, history } from 'umi';
import type { ConnectProps } from 'umi';
import type { ConnectState } from '@/models/connect';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Dropdown, Menu } from 'antd';
import { DownOutlined, PlusOutlined } from '@ant-design/icons';
import type { AppInfo } from '@/models/app';
import { StrategyInfo } from '@/models/strategy';
import { queryStrategyList } from '@/services/strategy';
import { StrategyType } from '@/consts/strategy/const';
import './index.less';
import _ from 'lodash';
import { GroupInfo } from '@/models/group';

export type StrategyListProps = {
  currentApp?: AppInfo;
  currentGroup?: GroupInfo;
} & Partial<ConnectProps>;

const StrategyList: React.FC<StrategyListProps> = (props) => {
  const { currentApp,currentGroup } = props;
  const actionRef = useRef<ActionType>();

  const [tableLoading, setTableLoading] = useState<boolean>(false);

  useEffect(() => {
    actionRef.current?.reload();
  }, [currentApp]);

  const renderBtn = (record: StrategyInfo) => {
    let cloneBtn = (
      <a
        key="cloneBtn"
        onClick={() => {
          history.push(
            `/knowledge/strategy/update?app_id=${currentApp?.id}&id=${record.id}&is_copy=1`,
          );
        }}
      >
        克隆
      </a>
    );
    let editBtn = (
      <a
        key="editBtn"
        onClick={() => {
          history.push(`/knowledge/strategy/update?app_id=${currentApp?.id}&id=${record.id}`);
        }}
      >
        编辑
      </a>
    );

    let detailBtn = (
      <a
        key="detailBtn"
        onClick={() => {
          history.push(`/knowledge/strategy/detail?app_id=${record.appId}&id=${record.id}`);
        }}
      >
        详情
      </a>
    );

    const moreMenu = (
      <Menu>
        <Menu.Item>{cloneBtn}</Menu.Item>
        <Menu.Item>{detailBtn}</Menu.Item>
      </Menu>
    );

    const moreBtn = (
      <Dropdown key="more" overlay={moreMenu}>
        <a onClick={(e) => e.preventDefault()}>
          操作 <DownOutlined />
        </a>
      </Dropdown>
    );

    return [editBtn, moreBtn];
  };

  const columns: ProColumns<StrategyInfo>[] = [
    {
      title: '所属包',
      dataIndex: 'packageName',
    },
    {
      title: '策略名称',
      dataIndex: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
    },
    {
      title: '类型',
      dataIndex: 'type',
      valueEnum: StrategyType,
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
        headerTitle="策略列表"
        actionRef={actionRef}
        rowKey="id"
        // search={{
        //   className: 'display-none-search',
        // }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              history.push(`/knowledge/strategy/update?app_id=${currentApp?.id}`);
            }}
          >
            <PlusOutlined /> 新建策略
          </Button>,
        ]}
        options={false}
        loading={tableLoading}
        request={async (params) => {
          const { pageSize, current = 1, ...other } = params;
          setTableLoading(true);
          const result = await queryStrategyList({
            pageIndex: current - 1,
            pageSize,
            appId: currentApp && currentApp.id,
            groupId: currentGroup && currentGroup.groupId,
            ...other,
          });
          setTableLoading(false);
          if(result.code === 11111) {
            history.push('/unselected');
          }
          return {
            data: result.data.datas,
            success: true,
            total: result.data.totalCount,
          };
        }}
        pagination={{
          pageSize: 10,
        }}
        columns={columns}
        // rowClassName={(record, index) => {
        //   return !_.isEmpty(record.upgradedFeature) ? 'table-color-red' : '';
        // }}
      />
    </PageContainer>
  );
};

export default connect(({ app }: ConnectState) => ({
  currentApp: app.currentApp,
  currentGroup: app.currentGroup,
}))(StrategyList);
