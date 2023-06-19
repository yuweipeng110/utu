import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'umi';
import type { ConnectProps, Dispatch } from 'umi';
import type { ConnectState } from '@/models/connect';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Dropdown, Menu, message, Popconfirm, Spin } from 'antd';
import { PlusOutlined, FileTextOutlined, DownOutlined } from '@ant-design/icons';
import type { AppScene } from '@/models/app';
import { deleteScene, getSceneWhitelist, querySceneList } from '@/services/app';
import type { InitMaster } from '@/models/app';
import type { AppInfo } from '@/models/app';
import type { CurrentUser } from '@/models/user';
import EidtScene from '@/pages/app/components/ModalForm/EditScene';
import InitMasterResultModal from '@/pages/app/components/Modal/InitMasterResultModal';
import SceneConfig from '@/pages/app/components/Modal/SceneConfig';
import EditSceneWhitelist from './components/ModalForm/EditSceneWhitelist';
import './index.less';
import _ from 'lodash';

export type SceneListProps = {
  dispatch: Dispatch;
  currentApp?: AppInfo;
  currentUser?: CurrentUser;
} & Partial<ConnectProps>;

const SceneList: React.FC<SceneListProps> = (props) => {
  const { currentApp, currentUser } = props;
  const actionRef = useRef<ActionType>();
  // 白名单操作人员工号
  const whitelistListEmpIds = ['WB934005', 'WB01044834', '355428'];

  const [loading, setLoading] = useState(false);
  const [initMasterResultModalVisible, handleInitMasterResultModalVisible] =
    useState<boolean>(false);
  const [initMaster, setInitMaster] = useState<InitMaster>(Object.create(null));
  const [sceneConfigModalVisible, handleSceneConfigModalVisible] = useState<boolean>(false);
  const [currentData, setCurrentData] = useState<AppScene>(Object.create(null));
  const [editSceneWhitelistModalVisible, setEditSceneWhitelistModalVisible] =
    useState<boolean>(false);
  const [sceneWhitelist, setSceneWhitelist] = useState<string[]>([]);
  const [sceneEditModalVisible, setSceneEditModalVisible] = useState<boolean>(false);
  const [editSceneTitle, setEditSceneTitle] = useState<string>('');

  const editSceneModalStatusSwitch = (
    editSceneModalStatus: boolean,
    rowEditSceneTitle: string,
    rowCurrentData?: any,
  ) => {
    setEditSceneTitle(rowEditSceneTitle);
    setCurrentData(rowCurrentData);
    setSceneEditModalVisible(editSceneModalStatus);
  };

  const getSceneWhiteListRequest = async () => {
    if (currentApp) {
      const res = await getSceneWhitelist({
        appId: Number(currentApp?.id),
      });
      setSceneWhitelist(res.data);
    }
  };

  const refreshCurrent = async () => {
    actionRef.current?.reload();
    await getSceneWhiteListRequest();
  };

  useEffect(() => {
    refreshCurrent();
  }, [currentApp]);

  const renderBtn = (record: AppScene) => {
    const intoBtn = (
      <a
        key="intoBtn"
        href={`#/scene/experiment?app_id=${record.appId}&scene_id=${record.sceneId}`}
        target="_blank"
      >
        进入场景
      </a>
    );
    const seeStreategyBtn = (
      <a
        key="seeStreategyBtn"
        href={`#/app/scene/strategy?app_id=${record.appId}&scene_id=${record.sceneId}`}
      >
        查看策略
      </a>
    );
    const editBtn = (
      <a key="editBtn" onClick={() => editSceneModalStatusSwitch(true, '编辑场景', record)}>
        编辑
      </a>
    );
    const deleteBtn = (
      <Popconfirm
        title="确定要删除吗？"
        key="deleteFirm"
        onConfirm={async () => {
          setLoading(true);
          const res = await deleteScene({
            sceneId: record.sceneId,
          });
          setLoading(false);
          if (res.code === 1) {
            message.success('删除成功');
            actionRef.current?.reload();
          } else {
            message.error(res.message);
          }
        }}
      >
        <a key="deleteBtn">删除</a>
      </Popconfirm>
    );

    let moreMenu;
    let moreBtn;
    moreMenu = (
      <Menu>
        <Menu.Item>{seeStreategyBtn}</Menu.Item>
        <Menu.Item>{editBtn}</Menu.Item>
        <Menu.Item>{deleteBtn}</Menu.Item>
      </Menu>
    );

    moreBtn = (
      <Dropdown key="moreBtn" overlay={moreMenu}>
        <a onClick={(e) => e.preventDefault()}>
          操作 <DownOutlined />
        </a>
      </Dropdown>
    );

    return [intoBtn, moreBtn];
  };

  const columns: ProColumns<AppScene>[] = [
    {
      title: '场景Code',
      dataIndex: 'sceneCode',
      hideInSearch: true,
    },
    {
      title: '场景Name',
      dataIndex: 'sceneName',
      hideInSearch: true,
    },
    {
      title: '场景配置',
      dataIndex: 'sceneName',
      hideInSearch: true,
      align: 'center',
      render: (value, record) => {
        return (
          <a
            key="sceneConfig"
            onClick={() => {
              setCurrentData(record);
              handleSceneConfigModalVisible(true);
            }}
          >
            <FileTextOutlined />
          </a>
        );
      },
    },
    {
      title: '实验流量阈值',
      dataIndex: 'maxFlowRatio',
      hideInSearch: true,
      valueType: 'percent',
    },
    {
      title: '剩余流量',
      dataIndex: 'surplusFlowRatio',
      hideInSearch: true,
      valueType: {
        type: 'progress',
        status: 'active',
      },
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      align: 'center',
      width: '150px',
      render: (value, record: AppScene) => renderBtn(record),
    },
  ];

  return (
    <PageContainer>
      <Spin spinning={loading} size="large">
        <div className="scene-list">
          <ProTable<AppScene>
            headerTitle="场景列表"
            actionRef={actionRef}
            rowKey="sceneId"
            search={{
              className: 'display-none-search',
            }}
            toolBarRender={() => [
              // currentApp && whitelistListEmpIds.indexOf(currentUser?.empId as string) !== -1 ? (
              //   <Button
              //     type="primary"
              //     key="whitelistBtn"
              //     onClick={() => {
              //       setEditSceneWhitelistModalVisible(true);
              //     }}
              //   >
              //     白名单
              //   </Button>
              // ) : (
              //   <></>
              // ),
              <Button
                type="primary"
                key="primary"
                onClick={() => {
                  editSceneModalStatusSwitch(true, '新建场景');
                }}
              >
                <PlusOutlined /> 新建场景
              </Button>,
            ]}
            options={false}
            request={async (params) => {
              const { pageSize, current = 1, ...other } = params;
              const result = await querySceneList({
                pageIndex: current - 1,
                pageSize,
                appId: currentApp && currentApp.id,
                ...other,
              });
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
        </div>
      </Spin>
      <EidtScene
        refreshCurrent={refreshCurrent}
        title={editSceneTitle}
        visible={sceneEditModalVisible}
        onVisibleChange={setSceneEditModalVisible}
        currentData={currentData}
        setInitMaster={setInitMaster}
        handleInitMasterResultModalVisible={handleInitMasterResultModalVisible}
      />
      <InitMasterResultModal
        visible={initMasterResultModalVisible}
        onVisibleChange={handleInitMasterResultModalVisible}
        currentInitMaster={initMaster}
      />
      <SceneConfig
        visible={sceneConfigModalVisible}
        onVisibleChange={handleSceneConfigModalVisible}
        currentData={currentData}
      />
      <EditSceneWhitelist
        refreshCurrent={refreshCurrent}
        visible={editSceneWhitelistModalVisible}
        onVisibleChange={setEditSceneWhitelistModalVisible}
        currentApp={currentApp}
        sceneWhitelist={sceneWhitelist}
      />
    </PageContainer>
  );
};

export default connect(({ app, user }: ConnectState) => ({
  currentApp: app.currentApp,
  currentUser: user.currentUser,
}))(SceneList);
