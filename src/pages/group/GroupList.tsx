import React, { useEffect, useRef, useState } from 'react';
import { Button, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { deleteGroup, queryGroupList } from '@/services/group';
import { GroupInfo } from '@/models/group';
import EditGroup from './components/ModalForm/EditGroup';
import { checkCurrentUserIsSuperAdministrator } from '@/services/app';
import EditGroupAuthority from './components/ModalForm/EditGroupAuthority';
import { BucUser } from '@/models/app';
import _ from 'lodash';

const GroupList: React.FC = () => {
  const actionRef = useRef<ActionType>();

  const [groupEditModalVisible, setGroupEditModalVisible] = useState<boolean>(false);
  const [authorityEditModalVisible, setAuthorityEditModalVisible] = useState<boolean>(false);
  const [editGroupTitle, setEditGroupTitle] = useState<string>('');
  const [currentData, setCurrentData] = useState<GroupInfo>(Object.create(null));
  const [groupData, setGroupData] = useState(Object.create(null));

  const editGroupModalStatusSwitch = (
    editGroupModalStatus: boolean,
    rowEditGroupTitle: string,
    rowCurrentData?: any,
  ) => {
    setEditGroupTitle(rowEditGroupTitle);
    setCurrentData(rowCurrentData);
    setGroupEditModalVisible(editGroupModalStatus);
  };

  const handleDeleteRequest = async (groupId: number) => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在删除...', key: loadingKey, duration: 0 });
    const res = await deleteGroup({
      groupId: Number(groupId),
    });
    if (res.code !== 1) {
      message.error({ content: res.message, key: loadingKey, duration: 2 });
      return false;
    }
    actionRef.current?.reload();
    message.success({ content: '删除成功', key: loadingKey, duration: 2 });
    return true;
  };

  const columns: ProColumns<GroupInfo>[] = [
    {
      title: 'GROUP Code',
      dataIndex: 'groupCode',
    },
    {
      title: '描述',
      dataIndex: 'groupDesc',
      ellipsis: true,
    },
    {
      title: '修改人',
      dataIndex: 'updateUser',
    },
    {
      title: '修改时间',
      dataIndex: 'updateTime',
      valueType: 'dateTime',
      width: 170,
    },
    {
      title: '管理员权限人员',
      dataIndex: 'empUsers',
      key: 'empUsers',
      width: 300,
      render: (dom, record) => {
        return !_.isEmpty(record) && !_.isEmpty(record.userList)
          ? record.userList.map((item: BucUser, index: number) => (
              <Tag key={`${record.groupId}_${index}`}>
                {item.empId}-{item.empName}
              </Tag>
            ))
          : '';
      },
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 200,
      render: (dom, record) => {
        const authorityBtn = (
          <a
            key="authorityBtn"
            onClick={() => {
              setCurrentData(record);
              setAuthorityEditModalVisible(true);
            }}
          >
            管理员权限
          </a>
        );
        const editBtn = (
          <a key="editBtn" onClick={() => editGroupModalStatusSwitch(true, '编辑组', record)}>
            编辑
          </a>
        );
        const deleteBtn = (
          <Popconfirm
            key="deleteBtn"
            title="确定要删除吗？"
            onConfirm={() => handleDeleteRequest(record.groupId)}
          >
            <a key="delete">删除</a>
          </Popconfirm>
        );

        if (record.roleType <= 1) {
          return [authorityBtn, editBtn];
        }
        return [];
      },
    },
  ];

  return (
    <PageContainer>
      <ProTable<GroupInfo>
        headerTitle="组列表"
        actionRef={actionRef}
        rowKey="groupId"
        search={false}
        toolBarRender={() => [
          !_.isEmpty(groupData) && groupData.highRoleType === 0 && (
            <Button
              type="primary"
              key="primary"
              onClick={() => editGroupModalStatusSwitch(true, '新建组')}
            >
              <PlusOutlined /> 新建组
            </Button>
          ),
        ]}
        options={false}
        request={async (params) => {
          const { pageSize, current = 1, ...other } = params;
          const result = await queryGroupList({
            pageIndex: current - 1,
            pageSize,
            ...other,
          });
          setGroupData(result.data);
          return {
            data: result.data.groupInfoVOS,
            success: true,
            total: result.data.totalNum,
          };
        }}
        pagination={{
          pageSize: 10,
        }}
        columns={columns}
      />
      <EditGroup
        actionRef={actionRef}
        title={editGroupTitle}
        visible={groupEditModalVisible}
        onVisibleChange={setGroupEditModalVisible}
        currentData={currentData}
      />
      <EditGroupAuthority
        actionRef={actionRef}
        visible={authorityEditModalVisible}
        onVisibleChange={setAuthorityEditModalVisible}
        currentData={currentData}
      />
    </PageContainer>
  );
};

export default GroupList;
