import React, { useEffect, useState } from 'react';
import { history, Link } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, Card, Space, Spin } from 'antd';
import ProDescriptions, { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import {
  getBranchLatestStableInformation,
  getPublishOrderBranchInformation,
} from '@/services/rule';
import type { BranchDetail, BranchStage } from '@/models/rule';
import { StrategyRuleRelation } from '@/models/strategy';
import NewStep1 from './components/NewStep1';
import DiffStrategyList from '@/components/ModalForm/DiffStrategyList';
import TOML from '@iarna/toml';
import './index.less';

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
  const baseVersion = query.base_version;
  const publishOrderId = query.publish_order_id;
  const isOnline = query.is_online;
  const createUser = query.create_user;

  const [loading, setLoading] = useState(false);
  const [branchDetail, setBranchDetail] = useState<BranchDetail>(Object.create(null));
  const [branchStrategyList, setBranchStrategyList] = useState<StrategyRuleRelation[]>([]);
  const [ruleObject, setRuleObject] = useState(Object.create(null));
  const [currentTab, setCurrentTab] = useState<string>('');
  const [diffStrategyListModalVisible, setDiffStrategyListModalVisible] = useState<boolean>(false);
  // tabList 明细、草稿、线上、对比
  const editTabList = ['detail', 'draft', 'online', 'diff'];
  // 分支类型： master、对照组， OR isEdit： 1
  const readOnly =
    branchDetail?.branchType === 0 || branchDetail?.branchType === 3 || Number(listType) === 1;

  // 获取分支详情
  const getBranchInfo = async () => {
    const params: any = {
      appId: Number(appId),
      sceneId: Number(sceneId),
      branchId: Number(branchId),
      accessMode: Number(accessMode),
      baseVersion: baseVersion === 'null' ? null : baseVersion,
      publishOrderId: Number(publishOrderId),
      isOnline: Number(isOnline),
      createUser,
    };
    let res;
    if (Number(accessMode) === 0) {
      res = await getBranchLatestStableInformation(params);
    } else {
      params.version = Number(version);
      res = await getPublishOrderBranchInformation(params);
    }
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
      setBranchStrategyList(res.branchStrategyList);
    }
    if (!_.isEmpty(res.upgradedFeatureList)) {
      setDiffStrategyListModalVisible(true);
    }
  };

  const refreshCurrent = async () => {
    setLoading(true);
    await getBranchInfo();
    setLoading(false);
  };

  useEffect(() => {
    refreshCurrent();
  }, []);

  const editRuleBtn = () => {
    // 不是从发布单详情进入 and readOnly === false
    return Number(accessMode) === 0 && !readOnly ? (
      <Button type="primary">
        <Link
          to={`/scene/rule/update?id=${branchId}&app_id=${appId}&scene_id=${sceneId}&list_type=${listType}&access_mode=${accessMode}`}
        >
          编辑
        </Link>
      </Button>
    ) : (
      <></>
    );
  };

  const renderShowTitleVersion = () => {
    if (Number(accessMode) === 1) {
      return `当前版本:V${branchDetail.baseVersion || 0}`;
    }
    // 分支详情显示
    if (currentTab === 'detail') {
      return `当前版本:V${branchDetail.publishVersion || 0}`;
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

  return (
    <PageContainer>
      <Spin spinning={loading} size="large">
        <Card
          title={
            <h3>
              {branchDetail?.branchName}
              <span style={{ color: 'red' }}>({renderShowTitleVersion()})</span>
            </h3>
          }
          extra={<Space size="small">{editRuleBtn()}</Space>}
        >
          <ProDescriptions
            bordered
            column={3}
            title={false}
            dataSource={branchDetail}
            columns={viewColumns}
            style={{ width: '100%' }}
            size="small"
          />
        </Card>
        <NewStep1
          branchDetail={branchDetail}
          branchId={query.id || ''}
          isEdit={listType}
          branchStrategyList={branchStrategyList}
          setBranchStrategyList={setBranchStrategyList}
          setLoading={setLoading}
          isEditMode={false}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          editTabList={editTabList}
          setRuleObject={setRuleObject}
          ruleObject={ruleObject}
        />
      </Spin>
      <DiffStrategyList
        visible={diffStrategyListModalVisible}
        onVisibleChange={setDiffStrategyListModalVisible}
        relyonFeatureData={branchDetail.upgradedFeatureList || ''}
        onFinish={() => {
          setDiffStrategyListModalVisible(false);
        }}
      />
    </PageContainer>
  );
};

export default UpdateView;
