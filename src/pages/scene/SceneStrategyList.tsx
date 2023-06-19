import React, { useEffect, useRef, useState } from 'react';
import { connect, history } from 'umi';
import type { ConnectProps } from 'umi';
import type { ConnectState } from '@/models/connect';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, message } from 'antd';
import type { AppInfo } from '@/models/app';
import { StrategyInfo } from '@/models/strategy';
import { StrategyType } from '@/consts/strategy/const';
import { getSceneUseFlowDetail } from '@/services/app';
import { getPageQuery } from '@/utils/utils';
import _ from 'lodash';

export type SceneStrategyListProps = {
  currentApp?: AppInfo;
} & Partial<ConnectProps>;

const SceneStrategyList: React.FC<SceneStrategyListProps> = (props) => {
  const { currentApp } = props;
  const actionRef = useRef<ActionType>();
  const queryParams = getPageQuery();
  const appId = queryParams['app_id'];
  const sceneId = queryParams['scene_id'];

  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [currentData, setCurrentData] = useState(Object.create(null));

  useEffect(() => {
    actionRef.current?.reload();
  }, [currentApp]);

  useEffect(() => {
    if (!_.isEmpty(currentData) && !_.isEmpty(currentData.warnMessage)) {
      message.error(currentData.warnMessage);
    }
  }, [currentData]);

  const columns: ProColumns<StrategyInfo>[] = [
    {
      title: '所属包',
      dataIndex: 'packageName',
    },
    {
      title: '策略名称',
      dataIndex: 'name',
      // hideInSearch: true,
    },
    {
      title: '描述',
      dataIndex: 'description',
      // hideInSearch: true,
      ellipsis: true,
    },
    {
      title: '类型',
      dataIndex: 'type',
      valueEnum: StrategyType,
      // hideInSearch: true,
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
  ];

  return (
    <PageContainer>
      <ProTable<StrategyInfo>
        headerTitle={<>策略列表</>}
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          currentData.isUseFlow && (
            <Button
              type="primary"
              key="primary"
              onClick={() => {
                history.push(
                  `/knowledge/flow/update?app_id=${currentApp?.id}&id=${currentData.flowId}&version=${currentData.version}`,
                );
              }}
            >
              查看决策流
            </Button>
          ),
        ]}
        options={false}
        loading={tableLoading}
        request={async (params) => {
          const { pageSize, current = 1, ...other } = params;
          setTableLoading(true);
          const result = await getSceneUseFlowDetail({
            pageIndex: current - 1,
            pageSize,
            appId: Number(appId),
            sceneId: Number(sceneId),
            ...other,
          });
          setTableLoading(false);
          setCurrentData(result.datas[0]);
          return {
            data: result.datas[0].infoList,
            success: true,
            total: result.totalCount,
          };
        }}
        pagination={{
          pageSize: 10,
        }}
        columns={columns}
        rowClassName={(record, index) => {
          return !_.isEmpty(record.upgradedFeature) ? 'table-color-red' : '';
        }}
      />
    </PageContainer>
  );
};

export default connect(({ app }: ConnectState) => ({
  currentApp: app.currentApp,
}))(SceneStrategyList);
