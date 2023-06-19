import React, { useEffect, useRef, useState } from 'react';
import { history, Prompt } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Spin, Tag } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import ProDescriptions, { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import { editBranch, getOnlineContent } from '@/services/rule';
import type { BranchDetail, BranchStage } from '@/models/rule';
import { StrategyRuleRelation } from '@/models/strategy';
import NewStep1 from './components/NewStep1';
import DiffRuleList from '@/components/ModalForm/DiffRuleList';
import TOML from '@iarna/toml';
import './index.less';
import _ from 'lodash';

const UpdateView: React.ReactNode = (props: { location: { query: any } }) => {
  const {
    location: { query },
  } = props;
  const branchId = query.id;
  const appId = query.app_id;
  const sceneId = query.scene_id;
  const listType = query.list_type;
  // 访问模式 0:（实验入口，开发视图，线上视图）、1:（发布单）历史版本的分支详情
  const accessMode = query.access_mode;
  const version = query.version;

  const step1Ref = useRef(null);
  const [loading, setLoading] = useState(false);
  const [branchDetail, setBranchDetail] = useState<BranchDetail>(Object.create(null));
  const [onlineBranchDetail, setOnlineBranchDetail] = useState<BranchDetail>(Object.create(null));
  const [branchStrategyList, setBranchStrategyList] = useState<StrategyRuleRelation[]>([]);
  const [oldBranchStrategyList, setOldBranchStrategyList] = useState<StrategyRuleRelation[]>([]);
  const [onlineBranchStrategyList, setOnlineBranchStrategyList] = useState<StrategyRuleRelation[]>(
    [],
  );
  const [currentTab, setCurrentTab] = useState<string>('');
  const [ruleObject, setRuleObject] = useState(Object.create(null));
  const [diffStrategyListModalVisible, setDiffStrategyListModalVisible] = useState<boolean>(false);
  // tabList 明细、草稿、线上、对比
  const editTabList = ['detail', 'draft', 'online', 'diff'];

  // 编辑分支
  const editBranchInfo = async () => {
    const params: any = {
      appId: Number(appId),
      sceneId: Number(sceneId),
      branchId: Number(branchId),
    };
    if (Number(accessMode) === 1) {
      params.version = Number(version);
    }
    const res = await editBranch(params);
    if (res.code && res.code === -1) {
      history.push('/error');
      return;
    }
    if (res.ruleContent) {
      const tomlData = TOML.parse(res.ruleContent);
      res.ruleGroups = tomlData?.stages as BranchStage[];
    }
    setBranchDetail(res);
    if (res.branchStrategyList) {
      const tmpList = _.uniqBy(
        (res.branchStrategyList as StrategyRuleRelation[]) || [],
        'strategyId',
      );
      setBranchStrategyList(tmpList);
      setOldBranchStrategyList(tmpList);
    }
    if (!_.isEmpty(res.upgradedFeatureList)) {
      setDiffStrategyListModalVisible(true);
    }
  };

  // 编辑分支
  const editBranchInfoOnline = async () => {
    const params: any = {
      appId: Number(appId),
      sceneId: Number(sceneId),
      branchId: Number(branchId),
    };
    if (Number(accessMode) === 1) {
      params.version = Number(version);
    }
    const res = await getOnlineContent(params);
    if (res.code && res.code === -1) {
      history.push('/error');
      return;
    }
    if (res.ruleContent) {
      const tomlData = TOML.parse(res.ruleContent);
      res.onlineRuleGroups = tomlData?.stages as BranchStage[];
    }
    setOnlineBranchDetail(res);
    if (res.branchStrategyList) {
      setOnlineBranchStrategyList(res.branchStrategyList);
    }
  };

  const refreshCurrentEdit = async () => {
    setLoading(true);
    await editBranchInfo();
    setLoading(false);
  };

  useEffect(() => {
    refreshCurrentEdit();
  }, []);

  // const handleKeyDown = (e: any) => {
  //   if (e.keyCode === 83 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) {
  //     e.preventDefault();
  //     if (currentTab === editTabList[1] && (step1Ref.current as any) !== null) {
  //       (step1Ref.current as any).onSaveContent();
  //     }
  //   }
  // };
  //
  // useMemo(() => {
  //   if (!readOnly) {
  //     document.addEventListener('keydown', handleKeyDown);
  //   }
  //   return () => {
  //     document.removeEventListener('keydown', handleKeyDown);
  //   };
  // }, [currentTab]);

  const renderShowTitleVersion = () => {
    if (currentTab === 'draft') {
      return `(草稿版本:V${branchDetail.baseVersion || 0})`;
    } else if (currentTab === 'online') {
      if (onlineBranchDetail.publishContent === null || onlineBranchDetail.isOnline === -1) {
        return '(该分支暂未发布)';
      }
      return `(线上版本:V${onlineBranchDetail.publishVersion || 0})`;
    }
    return '';
  };

  const viewColumns: ProDescriptionsItemProps<BranchDetail>[] = [
    {
      title: '分支名称',
      dataIndex: 'branchName',
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
    {
      title: '描述',
      dataIndex: 'branchDescription',
      ellipsis: true,
    },
  ];

  const draftViewColumns: ProDescriptionsItemProps<BranchDetail>[] = [
    {
      title: '分支名称',
      dataIndex: 'branchName',
    },
    {
      title: '修改人',
      dataIndex: 'draftUpdateUser',
    },
    {
      title: '修改时间',
      dataIndex: 'draftUpdateTime',
      valueType: 'dateTime',
    },
    {
      title: '描述',
      dataIndex: 'branchDescription',
      ellipsis: true,
    },
  ];

  return (
    <PageContainer>
      <Spin spinning={loading} size="large">
        <Card
          title={
            <h3>
              {branchDetail?.branchName}
              <span style={{ color: 'red' }}>{renderShowTitleVersion()}</span>
              {(branchDetail.baseVersion || 0) !== (branchDetail.publishVersion || 0) && (
                <Tag
                  icon={<ExclamationCircleOutlined />}
                  color="error"
                  style={{
                    marginLeft: 10,
                  }}
                >
                  当前分支内容有变更，线上版本V{branchDetail.publishVersion}
                </Tag>
              )}
            </h3>
          }
        >
          <ProDescriptions
            bordered
            column={3}
            title={false}
            dataSource={branchDetail}
            columns={
              currentTab !== editTabList[1] && currentTab !== editTabList[3]
                ? viewColumns
                : draftViewColumns
            }
            style={{ width: '100%' }}
            size="small"
          />
        </Card>
        <NewStep1
          ref={step1Ref}
          branchDetail={branchDetail}
          branchId={query.id || ''}
          onRefreshEditDetail={editBranchInfo}
          isEdit={listType}
          branchStrategyList={branchStrategyList}
          setBranchStrategyList={setBranchStrategyList}
          oldBranchStrategyList={oldBranchStrategyList}
          setLoading={setLoading}
          isEditMode={true}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          editTabList={editTabList}
          setRuleObject={setRuleObject}
          ruleObject={ruleObject}
          onlineBranchDetail={onlineBranchDetail}
          editBranchInfoOnline={editBranchInfoOnline}
        />
      </Spin>
      <DiffRuleList
        visible={diffStrategyListModalVisible}
        onVisibleChange={setDiffStrategyListModalVisible}
        relyonFeatureData={branchDetail.upgradedFeatureList || ''}
        onFinish={() => {
          setDiffStrategyListModalVisible(false);
        }}
      />
      <Prompt
        when={true}
        message={(location, action) => {
          if (action === 'POP') {
            return `离开当前页后，所编辑的数据将不可恢复`;
          }
          return true;
        }}
      />
    </PageContainer>
  );
};

export default UpdateView;
