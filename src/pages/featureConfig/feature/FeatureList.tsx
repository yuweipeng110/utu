import React, { useRef, useState, useEffect } from 'react';
import { connect, history } from 'umi';
import type { ConnectProps } from 'umi';
import type { ConnectState } from '@/models/connect';
import { Button, Dropdown, Menu, message, Popconfirm, Tag, Typography } from 'antd';
import { DownOutlined, PlusOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { deleteFeature, queryFeatureList } from '@/services/featureConfig';
import type { FeatureInfo } from '@/models/featureConfig';
import EditFeature from '@/pages/featureConfig/feature/components/ModalForm/EditFeature';
import { FeatureSource, FeatureDataZhType } from '@/consts/feature/const';
import { GroupInfo } from '@/models/group';
import type { AppInfo } from '@/models/app';
import type { CurrentUser } from '@/models/user';
import EditAuthority from './components/ModalForm/EditAuthority';
import DiffFeautreList from '@/components/ModalForm/DiffFeatureList';
import './index.less';
import _ from 'lodash';

const { Paragraph } = Typography;

export type FeatureListProps = {
  currentApp?: AppInfo;
  currentGroup?: GroupInfo;
  currentUser?: CurrentUser;
} & Partial<ConnectProps>;

const FeatureList: React.FC<FeatureListProps> = (props) => {
  const { currentApp, currentGroup, currentUser } = props;
  const actionRef = useRef<ActionType>();

  // 白名单操作人员工号
  const whitelistListEmpIds = ['110682', '292292', '355428'];

  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editFeatureModalVisible, handleEditFeatureModalVisible] = useState<boolean>(false);
  const [currentData, setCurrentData] = useState<FeatureInfo>(Object.create(null));
  const [isView, setIsView] = useState<boolean>(false);
  const [isCopy, setIsCopy] = useState<boolean>(false);
  const [editAuthorityModalVisible, handleEditAuthorityModalVisible] = useState<boolean>(false);
  const [diffFeatureListModalVisible, setDiffFeatureListModalVisible] = useState<boolean>(false);

  useEffect(() => {
    actionRef.current?.reload();
  }, [currentApp]);

  const editFeatureModalStatusSwitch = (
    editFeatureTitle: string,
    editFeatureModalStatus: boolean,
    rowCurrentData?: any,
    rowIsView?: boolean,
    rowIsCopy?: boolean,
  ) => {
    setEditTitle(editFeatureTitle);
    handleEditFeatureModalVisible(editFeatureModalStatus);
    setIsView(rowIsView || false);
    setIsCopy(rowIsCopy || false);
    setCurrentData(rowCurrentData);
  };

  const handleDeleteFeatureRequest = async (id: number) => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在删除...', key: loadingKey, duration: 0 });
    setTableLoading(true);
    const res = await deleteFeature({
      id,
      appId: currentApp && currentApp.id,
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

  const diffFeautreListOnFinish = (rowCurrentData: any) => {
    editFeatureModalStatusSwitch('修改', true, currentData, false);
    return true;
  };

  const columns: ProColumns<FeatureInfo>[] = [
    {
      title: '名称',
      dataIndex: 'featureName',
      render: (dom, record) => {
        let domColor = '';
        if (!_.isEmpty(record.dependUpgraded) || !_.isEmpty(record.selfUpgraded)) {
          domColor = 'red';
        }
        return (
          <Paragraph copyable={{ text: record.featureName }} style={{ color: domColor, margin: 0 }}>
            {dom}
          </Paragraph>
        );
      },
    },
    {
      title: '描述',
      dataIndex: 'featureDesc',
      search: false,
      ellipsis: true,
    },
    {
      title: '类型',
      dataIndex: 'featureType',
      valueEnum: FeatureDataZhType,
      search: false,
    },
    {
      title: '默认值',
      dataIndex: 'featureValue',
      search: false,
      render: (dom, record) =>
        !_.isEmpty(record.featureValue) ? record.featureValue.replace('nil', '') : dom,
    },
    {
      title: '标签',
      dataIndex: 'tagName',
      width: '15%',
      render: (value: any, record) => {
        if (record.featureTags) {
          return record.featureTags.map((item: any, index) => (
            <Tag key={`${record.id}_${index}`}>{item}</Tag>
          ));
        }
        return null;
      },
    },
    {
      title: '来源',
      dataIndex: 'source',
      valueEnum: FeatureSource,
      search: false,
    },
    {
      title: '操作',
      search: false,
      valueType: 'option',
      align: 'center',
      width: '150px',
      render: (dom, record) => {
        let cloneBtn = (
          <a
            key="cloneBtn"
            onClick={() => editFeatureModalStatusSwitch('新增特征', true, record, false, true)}
          >
            克隆
          </a>
        );
        let viewBtn = (
          <a key="viewBtn" onClick={() => editFeatureModalStatusSwitch('查看', true, record, true)}>
            查看
          </a>
        );
        let editBtn = (
          <a
            key="editBtn"
            onClick={() => editFeatureModalStatusSwitch('修改', true, record, false)}
          >
            修改
          </a>
        );
        if (record.dependUpgraded || record.selfUpgraded) {
          viewBtn = (
            <a
              key="viewBtn"
              onClick={() => {
                setDiffFeatureListModalVisible(true);
                setCurrentData(record);
              }}
            >
              查看
            </a>
          );
          editBtn = (
            <a
              key="editBtn"
              onClick={() => {
                setDiffFeatureListModalVisible(true);
                setCurrentData(record);
              }}
            >
              修改
            </a>
          );
        }
        const deleteBtn = (
          <Popconfirm
            key="deleteFirm"
            title="确定要删除吗？"
            onConfirm={() => handleDeleteFeatureRequest(record.id)}
          >
            <a key="delete">删除</a>
          </Popconfirm>
        );

        let moreMenu;
        let moreBtn;
        if (!record.isModify || record.readOnly === 1) {
          moreMenu = (
            <Menu>
              <Menu.Item>{cloneBtn}</Menu.Item>
              <Menu.Item>{deleteBtn}</Menu.Item>
            </Menu>
          );

          moreBtn = (
            <Dropdown key="more" overlay={moreMenu}>
              <a onClick={(e) => e.preventDefault()}>
                操作 <DownOutlined />
              </a>
            </Dropdown>
          );
          return [viewBtn, moreBtn];
        }

        moreMenu = (
          <Menu>
            <Menu.Item>{cloneBtn}</Menu.Item>
            <Menu.Item>{editBtn}</Menu.Item>
            <Menu.Item>{deleteBtn}</Menu.Item>
          </Menu>
        );

        moreBtn = (
          <Dropdown key="more" overlay={moreMenu}>
            <a onClick={(e) => e.preventDefault()}>
              操作 <DownOutlined />
            </a>
          </Dropdown>
        );

        return [viewBtn, moreBtn];
      },
    },
  ];

  return (
    <PageContainer>
      <ProTable<FeatureInfo>
        headerTitle="特征列表"
        actionRef={actionRef}
        rowKey="id"
        options={false}
        toolBarRender={() => [
          whitelistListEmpIds.indexOf(currentUser?.empId as string) !== -1 ? (
            <Button
              type="primary"
              key="whitelistList"
              onClick={() => {
                handleEditAuthorityModalVisible(true);
              }}
            >
              白名单
            </Button>
          ) : (
            <></>
          ),
          <Button
            type="primary"
            key="add"
            onClick={() => {
              editFeatureModalStatusSwitch('新增特征', true);
            }}
          >
            <PlusOutlined /> 新增特征
          </Button>,
        ]}
        loading={tableLoading}
        request={async (params) => {
          const { pageSize, current = 1, ...other } = params;
          setTableLoading(true);
          const result = await queryFeatureList({
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
        //   return !_.isEmpty(record.dependUpgraded) || !_.isEmpty(record.selfUpgraded)
        //     ? 'table-color-red'
        //     : '';
        // }}
      />
      <EditFeature
        actionRef={actionRef}
        title={editTitle}
        visible={editFeatureModalVisible}
        onVisibleChange={handleEditFeatureModalVisible}
        currentData={currentData}
        isView={isView}
        isCopy={isCopy}
        setIsCopy={setIsCopy}
      />
      <EditAuthority
        actionRef={actionRef}
        visible={editAuthorityModalVisible}
        onVisibleChange={handleEditAuthorityModalVisible}
        currentApp={currentApp}
      />
      <DiffFeautreList
        visible={diffFeatureListModalVisible}
        onVisibleChange={setDiffFeatureListModalVisible}
        currentData={currentData}
        onFinish={diffFeautreListOnFinish}
      />
    </PageContainer>
  );
};

export default connect(({ app, user }: ConnectState) => ({
  currentApp: app.currentApp,
  currentGroup: app.currentGroup,
  currentUser: user.currentUser,
}))(FeatureList);
