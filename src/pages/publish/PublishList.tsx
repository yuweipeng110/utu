import React, { useState } from 'react';
import { history, Link } from 'umi';
import { Button, message, Spin } from 'antd';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { PageContainer } from '@ant-design/pro-layout';
import type { RollBack } from '@/models/publish';
import { getRollbackList, fallbackVersion } from '@/services/publish';
import { getPageQuery } from '@/utils/utils';
import CreatePublishResult from '@/pages/publish/components/Modal/CreatePublishResult';
import './index.less';

const PublishList: React.FC = () => {
  const queryParams = getPageQuery();
  const appId = queryParams.app_id;
  const sceneId = queryParams.scene_id;

  const [selected, setSelected] = useState<RollBack>(Object.create(null));
  const [loading, setLoading] = useState<boolean>(false);
  const [createPublishResultModalVisible, setCreatePublishResultModalVisible] = useState<boolean>(false);
  const [apiResult, setApiResult] = useState(Object.create(null));
  const [snapshotOnline,setSnapshotOnline] = useState<RollBack[]>([]);

  const createPublishResultSwitch = (modalStatus: boolean, result: any) => {
    setApiResult(result);
    setCreatePublishResultModalVisible(true);
  };

  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      setSelected(selectedRows.length > 0 ? selectedRows[0] : '');
    },
  };

  const handleRollBackRequest = async (indexId: number) => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在提交发布单...', key: loadingKey, duration: 0 });
    setLoading(true);
    const res = await fallbackVersion({
      appId: Number(appId),
      sceneId: Number(sceneId),
      indexId,
      source: 3,
    });
    setLoading(false);
    if (res.code !== 1) {
      message.destroy();
      createPublishResultSwitch(true, res);
      return false;
    }
    message.destroy();
    createPublishResultSwitch(true, res);
    return true;
  };

  const onlineColumns: ProColumns<RollBack>[] = [
    {
      title: '当前版本',
      dataIndex: 'version',
      render: (dom,record) => <span style={{color: 'red'}}>{dom}</span>,
    },
    {
      title: '发布单名称',
      dataIndex: 'orderName',
      render: (dom, record: any) => {
        return <Link
          to={`/scene/publish/detail?app_id=${appId}&scene_id=${sceneId}&publish_order_id=${record.orderId}`}>{dom}</Link>;
      },
    },
    {
      title: '发布完成时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      ellipsis: true,
    },
    {
      title: '发布人',
      dataIndex: 'createUser',
    },
  ];

  const historyColumns: ProColumns<RollBack>[] = [
    {
      title: '快照版本',
      dataIndex: 'version',
      render: (dom,record) => <span style={{color: 'red'}}>{dom}</span>,
    },
    {
      title: '发布单名称',
      dataIndex: 'orderName',
      render: (dom, record: any) => {
        return <Link
          to={`/scene/publish/detail?app_id=${appId}&scene_id=${sceneId}&publish_order_id=${record.orderId}`}>{dom}</Link>;
      },
    },
    {
      title: '发布完成时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      ellipsis: true,
    },
    {
      title: '发布人',
      dataIndex: 'createUser',
    },
  ];

  return (
    <PageContainer>
      <div className="publish-list">
        <Spin spinning={loading}>
          <ProTable<RollBack>
            columns={onlineColumns}
            dataSource={snapshotOnline}
            pagination={false}
            rowKey="id"
            search={false}
            dateFormatter="string"
            headerTitle="线上版本"
            options={false}
          />
          <div style={{ marginTop: '20px' }}>
            <ProTable<RollBack>
              columns={historyColumns}
              // dataSource={snapshotHistoryList}
              request={async (params) => {
                const { pageSize, current = 1, ...other } = params;
                const result = await getRollbackList({
                  appId,
                  sceneId,
                  pageIndex: current - 1,
                  pageSize,
                  ...other,
                });

                setSnapshotOnline([result.datas[0].online]);
                return {
                  data: result.datas[0].historyList,
                  success: true,
                  total: result.totalCount,
                };
              }}
              pagination={{
                pageSize: 10,
              }}
              rowSelection={{
                type: 'radio',
                ...rowSelection,
              }}
              rowKey="id"
              search={false}
              dateFormatter="string"
              headerTitle="历史版本"
              options={false}
            />
            <div className="publish-btn">
              <Button
                size="large"
                type="default"
                onClick={() => {
                  history.push(
                    `/scene/publish?app_id=${queryParams.app_id}&scene_id=${queryParams.scene_id}`,
                  );
                }}
              >
                关闭
              </Button>
              <Button
                size="large"
                type="primary"
                onClick={() => {
                  if (!selected.id) {
                    message.warning('请选择历史版本进行回滚');
                    return;
                  }
                  handleRollBackRequest(selected.id);
                }}
              >
                回滚
              </Button>
            </div>
          </div>
        </Spin>
        <CreatePublishResult
          visible={createPublishResultModalVisible}
          onVisibleChange={setCreatePublishResultModalVisible}
          apiResult={apiResult}
        />
      </div>
    </PageContainer>
  );
};

export default PublishList;
