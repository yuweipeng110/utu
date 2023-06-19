import React, { useEffect, useRef, useState } from 'react';
import { history } from 'umi';
import { Button, Dropdown, Menu, message, Popconfirm, Tag } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownOutlined,
  PlusOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ExperimentGroup, ExperimentInfo } from '@/models/experiment';
import { deleteExperiment, getSurplusFlowRatio, queryExperimentList } from '@/services/experiment';
import { getPageQuery } from '@/utils/utils';
import {
  ExperimentGroupMark,
  ExperimentGroupType,
  ExperimentStatus,
  ExperimentType,
} from '@/consts/experiment/const';
import { submitPublishOrder } from '@/services/publish';
import ExperimentMergeBranch from '@/pages/experiment/components/ModalForm/ExperimentMergeBranch';
import EditExperimentWhitelist from '@/pages/experiment/components/ModalForm/EditExperimentWhitelist';
import EditFlowRatio from '@/pages/experiment/components/ModalForm/EditFlowRatio';
import CreatePublishResult from '@/pages/publish/components/Modal/CreatePublishResult';
import { AppScene } from '@/models/app';
import _ from 'lodash';

const ExperimentList: React.FC = () => {
  const actionRef = useRef<ActionType>();

  const queryParams = getPageQuery();
  const appId = queryParams.app_id;
  const sceneId = queryParams.scene_id;

  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [currentSceneInfo, setCurrentSceneInfo] = useState<AppScene>(Object.create(null));
  const [mergeExperimentModalVisible, setMergeExperimentModalVisible] = useState<boolean>(false);
  const [whitelistModalVisible, setWhitelistModalVisible] = useState<boolean>(false);
  const [flowRatioModalVisible, setFlowRatioModalVisible] = useState<boolean>(false);
  const [createPublishResultModalVisible, setCreatePublishResultModalVisible] =
    useState<boolean>(false);
  const [currentData, setCurrentData] = useState<Partial<ExperimentGroup>>(Object.create(null));
  const [apiResult, setApiResult] = useState(Object.create(null));

  const loadCurrentSceneInfo = async () => {
    const params = {
      appId,
      sceneId,
    };
    const res = await getSurplusFlowRatio(params);
    if (res.code && res.code === -1) {
      history.push('/error');
      return;
    }
    setCurrentSceneInfo(res.data);
  };

  const refreshCurrent = async () => {
    loadCurrentSceneInfo();
  };

  useEffect(() => {
    refreshCurrent();
  }, [appId, sceneId]);

  const createPublishResultSwitch = (modalStatus: boolean, result: any) => {
    setApiResult(result);
    setCreatePublishResultModalVisible(true);
  };

  const handleDeleteExperimentRequest = async (experimentId: number) => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在删除...', key: loadingKey, duration: 0 });
    setTableLoading(true);
    const res = await deleteExperiment({
      experimentId,
    });
    setTableLoading(false);
    if (res.code !== 1) {
      message.error({ content: res.message, key: loadingKey, duration: 2 });
      return false;
    }
    actionRef.current?.reload();
    message.success({ content: '删除成功', key: loadingKey, duration: 2 });
    return true;
  };

  const handlePublishRequest = async (source: number, experimentId: number) => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在提交发布单...', key: loadingKey, duration: 0 });
    const params = {
      appId,
      sceneId,
      source,
      id: experimentId,
    };
    setTableLoading(true);
    const res = await submitPublishOrder(params);
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

  const handleStopRequest = async (source: number, experimentId: number) => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在提交发布单...', key: loadingKey, duration: 0 });
    const params = {
      appId,
      sceneId,
      source,
      id: experimentId,
      action: 2,
    };
    setTableLoading(true);
    const res = await submitPublishOrder(params);
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

  const handleResetRequest = async (source: number, experimentId: number) => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在提交发布单...', key: loadingKey, duration: 0 });
    const params = {
      appId,
      sceneId,
      source,
      id: experimentId,
      action: 4,
    };
    setTableLoading(true);
    const res = await submitPublishOrder(params);
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

  const renderBtn = (record: ExperimentInfo) => {
    const source = record.type === 0 ? 0 : 2;
    const experimentId = record.id;
    const detailBtn = (
      <a
        key="detail"
        onClick={() => {
          history.push(
            `/scene/experiment/update?id=${record.id}&app_id=${record.appId}&scene_id=${record.sceneId}`,
          );
        }}
      >
        详情
      </a>
    );
    const publishBtn = (
      <Popconfirm
        key="publishBtn"
        title="确认操作？"
        onConfirm={() => handlePublishRequest(source, experimentId)}
      >
        <a>提交发布单</a>
      </Popconfirm>
    );
    const mergeBtn = (
      <a
        key="mergeBtn"
        onClick={() => {
          setCurrentData(record);
          setMergeExperimentModalVisible(true);
        }}
      >
        合并
      </a>
    );
    const stopBtn = (
      <Popconfirm
        key="stopBtn"
        title="确认操作？"
        onConfirm={() => handleStopRequest(source, experimentId)}
      >
        <a>下线</a>
      </Popconfirm>
    );
    const resetBtn = (
      <Popconfirm
        key="resetBtn"
        title="确认操作？"
        onConfirm={() => handleResetRequest(source, experimentId)}
      >
        <a>重启</a>
      </Popconfirm>
    );
    const editFlowRatioBtn = (
      <a
        key="editFlowRatioBtn"
        onClick={() => {
          setCurrentData(record);
          setFlowRatioModalVisible(true);
        }}
      >
        修改流量
      </a>
    );
    const editWhitelistBtn = (
      <a
        key="editWhitelistBtn"
        onClick={() => {
          setCurrentData(record);
          setWhitelistModalVisible(true);
        }}
      >
        修改白名单
      </a>
    );
    const deleteBtn = (
      <Popconfirm
        title="确定要删除吗？"
        key="deleteBtn"
        onConfirm={() => handleDeleteExperimentRequest(experimentId)}
      >
        <a>删除</a>
      </Popconfirm>
    );

    let experimentingBtnOver;
    switch (record.publishStatus) {
      case 0:
        experimentingBtnOver = (
          <Menu>
            <Menu.Item>{publishBtn}</Menu.Item>
            <Menu.Item>{editFlowRatioBtn}</Menu.Item>
            {!_.isEmpty(currentSceneInfo) && currentSceneInfo.diversionId && (
              <Menu.Item>{editWhitelistBtn}</Menu.Item>
            )}
            <Menu.Item>{deleteBtn}</Menu.Item>
          </Menu>
        );
        break;
      case 200:
        experimentingBtnOver = (
          <Menu>
            <Menu.Item>{publishBtn}</Menu.Item>
            <Menu.Item>{mergeBtn}</Menu.Item>
            <Menu.Item>{stopBtn}</Menu.Item>
            <Menu.Item>{editFlowRatioBtn}</Menu.Item>
            {!_.isEmpty(currentSceneInfo) && currentSceneInfo.diversionId && (
              <Menu.Item>{editWhitelistBtn}</Menu.Item>
            )}
          </Menu>
        );
        break;
      case 600:
        experimentingBtnOver = (
          <Menu>
            <Menu.Item>{resetBtn}</Menu.Item>
          </Menu>
        );
        break;
      default:
        experimentingBtnOver = null;
        break;
    }

    const experimentBtn = (
      // @ts-ignore
      <Dropdown key="more" overlay={experimentingBtnOver}>
        <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
          操作 <DownOutlined />
        </a>
      </Dropdown>
    );

    switch (record.publishStatus) {
      case 0:
        return [detailBtn, experimentBtn];
      case 200:
        return [detailBtn, experimentBtn];
      case 600:
        return [detailBtn, experimentBtn];
      default:
        return [detailBtn];
    }
  };

  const columns: ProColumns<ExperimentInfo>[] = [
    {
      title: '实验名称',
      dataIndex: 'name',
      hideInSearch: true,
    },
    {
      title: '实验类型',
      dataIndex: 'type',
      valueEnum: ExperimentType,
      hideInSearch: true,
      render: (dom, record) => {
        return record.type === 0 ? (
          <span style={{ color: '#2db7f5' }}>{dom}</span>
        ) : (
          <span style={{ color: '#87d068' }}>{dom}</span>
        );
      },
    },
    {
      title: '实验流量',
      dataIndex: 'flowRatio',
      valueType: {
        type: 'progress',
        status: 'active',
      },
      hideInSearch: true,
    },
    {
      title: '实验状态',
      dataIndex: 'publishStatus',
      valueEnum: ExperimentStatus,
      valueType: 'checkbox',
      initialValue: ['0', '200'],
      render: (dom, record) => {
        let content;
        switch (record.publishStatus) {
          case 0:
            content = <Tag color="warning">{dom}</Tag>;
            break;
          case 200:
            content = (
              <Tag color="processing" icon={<SyncOutlined spin />}>
                {dom}
              </Tag>
            );
            break;
          case 400:
            content = (
              <Tag color="success" icon={<CheckCircleOutlined />}>
                {dom}
              </Tag>
            );
            break;
          case 600:
            content = (
              <Tag color="error" icon={<CloseCircleOutlined />}>
                {dom}
              </Tag>
            );
            break;
        }
        return content;
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
      title: '发布时间',
      dataIndex: 'publishTime',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 150,
      hideInSearch: true,
      render: (text, record) => renderBtn(record),
    },
  ];

  const expandedRowRender = (record: ExperimentInfo) => {
    const data = record.experimentGroups;
    const ruleBranchColumns: ProColumns<ExperimentGroup>[] = [
      { title: '实验组名称', dataIndex: 'name' },
      { title: '类型', dataIndex: 'type', valueEnum: ExperimentGroupType },
      { title: '标记', dataIndex: 'mark', valueEnum: ExperimentGroupMark },
      { title: '流量配比', dataIndex: 'flowRatio', valueType: 'progress' },
      {
        title: '操作',
        dataIndex: 'operation',
        valueType: 'option',
        render: (text, detailRecord) => {
          const listType = record.publishStatus === 400 ? 1 : detailRecord.mark;
          return (
            <a
              key="detail"
              target="_blank"
              href={`#/scene/rule/detail?id=${detailRecord.objId}&app_id=${appId}&scene_id=${sceneId}&list_type=${listType}&access_mode=0`}
            >
              详情
            </a>
          );
        },
      },
    ];
    return (
      <ProTable<ExperimentGroup>
        columns={ruleBranchColumns}
        rowKey="branchId"
        headerTitle={false}
        search={false}
        options={false}
        // @ts-ignore
        dataSource={data}
        pagination={false}
      />
    );
  };

  return (
    <PageContainer>
      <ProTable<ExperimentInfo>
        headerTitle="实验列表"
        actionRef={actionRef}
        rowKey="id"
        search={{
          defaultCollapsed: false,
          span: 12,
          labelWidth: 'auto',
          // optionRender: () => {
          //   return [];
          // },
        }}
        options={false}
        loading={tableLoading}
        toolBarRender={() => [
          <Button
            type="primary"
            key="create"
            onClick={() => {
              history.push(`/scene/experiment/update?app_id=${appId}&scene_id=${sceneId}`);
            }}
          >
            <PlusOutlined /> 新建实验
          </Button>,
        ]}
        params={{
          appId,
          sceneId,
        }}
        request={async (params) => {
          const { pageSize, current = 1, ...other } = params;
          setTableLoading(true);
          const result = await queryExperimentList({
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
        pagination={{
          pageSize: 10,
        }}
        columns={columns}
        expandable={{ expandedRowRender: (record) => expandedRowRender(record) }}
      />
      <ExperimentMergeBranch
        actionRef={actionRef}
        visible={mergeExperimentModalVisible}
        onVisibleChange={setMergeExperimentModalVisible}
        currentData={currentData}
        createPublishResultSwitch={createPublishResultSwitch}
      />
      <EditFlowRatio
        actionRef={actionRef}
        visible={flowRatioModalVisible}
        onVisibleChange={setFlowRatioModalVisible}
        currentData={currentData}
        // currentSceneInfo={currentSceneInfo}
        createPublishResultSwitch={createPublishResultSwitch}
      />
      <EditExperimentWhitelist
        actionRef={actionRef}
        visible={whitelistModalVisible}
        onVisibleChange={setWhitelistModalVisible}
        currentData={currentData}
        createPublishResultSwitch={createPublishResultSwitch}
      />
      <CreatePublishResult
        visible={createPublishResultModalVisible}
        onVisibleChange={setCreatePublishResultModalVisible}
        apiResult={apiResult}
      />
    </PageContainer>
  );
};

export default ExperimentList;
