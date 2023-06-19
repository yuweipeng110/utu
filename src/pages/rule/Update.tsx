import React, { useEffect, useState } from 'react';
import { history } from 'umi';
import TOML, { JsonMap } from '@iarna/toml';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Button, message, Tooltip, Space, Popconfirm, Spin } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import ProDescriptions, { ProDescriptionsItemProps } from "@ant-design/pro-descriptions";
import {
  getBranchDetail,
  loadLatestVersionRuleBranch,
  saveRuleContent,
  saveStableRuleBranch,
  updateRuleBranch
} from '@/services/rule';
import { submitPublishOrder } from '@/services/publish';
import type { BranchDetail, BranchStage } from '@/models/rule';
import BranchModalForm from './components/ModalForm/BranchEditModalForm';
import Step1 from "./components/Step1"
import CreatePublishResult from "@/pages/publish/components/Modal/CreatePublishResult";
import { StrategyRuleRelation } from "@/models/strategy";
import { formatObject, formatString, validateString } from "@/utils/tomlUtils";
import { RuleBranchType } from "@/consts/ruleBranch/const";
import './index.less';
import _ from 'lodash';

const source = 1;

const UpdateView: React.ReactNode = (props: { location: { query: any } }) => {
  const {
    location: { query },
  } = props;
  const branchId = query.id;
  const appId = query.app_id;
  const sceneId = query.scene_id;
  const listType = query.list_type;
  const accessMode = query.access_mode;
  const version = query.version;
  const baseVersion = query.base_version;
  const [loading, setLoading] = useState(false);
  const [branchDetail, setBranchDetail] = useState<BranchDetail>(Object.create(null));
  const [createPublishResultModalVisible, setCreatePublishResultModalVisible] = useState<boolean>(false);
  const [apiResult, setApiResult] = useState(Object.create(null));
  const [branchStrategyList, setBranchStrategyList] = useState<StrategyRuleRelation[]>([]);
  const [sourceCode, setSourceCode] = useState<string>('');
  const [ruleObject, setRuleObject] = useState(Object.create(null));
  const [codeMode, setCodeMode] = useState<boolean>(false);
  const [showSave, setShowSave] = useState<boolean>(false);
  const [tomlError, setTomlError] = useState<string>('');

  // 分支类型： master、对照组， OR isEdit： 1
  const readOnly = branchDetail?.branchType === 0 || branchDetail?.branchType === 3 || Number(listType) === 1;

  const createPublishResultSwitch = (modalStatus: boolean, result: any) => {
    setApiResult(result);
    setCreatePublishResultModalVisible(true);
  }

  useEffect(() => {
    setRuleObject({ stages: branchDetail?.ruleGroups });
    setSourceCode(branchDetail?.ruleContent);
  }, [branchDetail]);

  const handleKeyDown = (e: any) => {
    if (e.keyCode === 83 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) {
      e.preventDefault();
      if (ruleObject.stages !== undefined) {
        onSaveContent();
      }
    }
  };

  useEffect(() => {
    // if (branchDetail.branchType === 1 || branchDetail.branchType === 2) {
    if (!readOnly) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [ruleObject]);

  const onSwitchCodeMode = () => {
    if (!codeMode) {
      setSourceCode(TOML.stringify(formatObject(ruleObject).data));
    }
    setCodeMode(!codeMode);
  };

  const onSourceCodeChange = (value: string) => {
    setShowSave(true);
    setSourceCode(value);
    setTomlError('');
  };

  const onGroupsFormChange = async (groups: BranchStage[]) => {
    setShowSave(true);
    setRuleObject({ ...ruleObject, stages: groups });
    setTomlError('');
  };

  const getBranchInfo = async () => {
    const params: any = {
      appId: Number(appId),
      sceneId: Number(sceneId),
      branchId: Number(branchId),
      accessMode: Number(accessMode),
      baseVersion: baseVersion === "null" ? null : baseVersion,
    };
    if (Number(accessMode) === 1) {
      params.version = Number(version);
    }
    const res = await getBranchDetail(params);
    if (res.code && res.code === -1) {
      history.push('/error');
      return;
    }
    if (res.ruleContent) {
      const tomlData = TOML.parse(res.ruleContent);
      res.ruleGroups = tomlData?.stages as BranchStage[];
    }
    setBranchDetail(res);
    if (res.branchStrategyList !== null) {
      const tmpStrategyList = res.branchStrategyList.map((item: any) => ({
        ...item,
        id: item.strategyId
      }));
      setBranchStrategyList(tmpStrategyList);
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

  const checkRuleContent = () => {
    try {
      let checkToml: boolean = true;
      const tomlData = TOML.parse(branchDetail.ruleContent);
      tomlData.stages.forEach((stage: any) => {
        stage.rules.forEach((item: any) => {
          checkToml = !_.isEmpty(item.exec.replace(/['"\\/\n]/g, ''));
        });
      });
      return checkToml;
    } catch (e) {
      return true;
    }
  }

  const handlePublishRequest = async () => {
    if (!checkRuleContent()) {
      message.error(`提交发布单失败：规则内容不允许为空`);
      return false;
    }
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在提交发布单成功...', key: loadingKey, duration: 0 });
    setLoading(true);
    const res = await submitPublishOrder({
      appId,
      sceneId,
      source,
      id: branchId,
      branchType: branchDetail.branchType,
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

  const handleMergeRequest = async () => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在提交发布单...', key: loadingKey, duration: 0 });
    setLoading(true);
    const res = await submitPublishOrder({
      appId,
      sceneId,
      source,
      id: branchId,
      branchType: branchDetail.branchType,
      action: 3,
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

  const handleStopRequest = async () => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在提交发布单...', key: loadingKey, duration: 0 });
    setLoading(true);
    const res = await submitPublishOrder({
      appId,
      sceneId,
      source,
      id: branchId,
      branchType: branchDetail.branchType,
      action: 2,
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


  const onSaveContent = async () => {
    let res;
    let content;

    if (codeMode) {
      res = validateString(sourceCode);
      if (res.code !== 1) {
        setTomlError(`${res.message}`);
        // message.error(res.message);
        return res;
      }
      content = TOML.stringify(formatString(sourceCode).data as JsonMap);
    } else {
      res = validateString(TOML.stringify(ruleObject));
      if (res.code !== 1) {
        setTomlError(`${res.formatMessage}`);
        // message.error(res.formatMessage);œ
        return res;
      }
      content = TOML.stringify(formatObject(ruleObject).data);
    }
    setLoading(true);
    res = await saveRuleContent({
      appId: branchDetail.appId,
      sceneId: branchDetail.sceneId,
      branchId: branchDetail.branchId,
      ruleContent: content,
      branchVersionId: branchDetail.branchVersionId,
      branchStrategyList: branchStrategyList.map((item,index) => {
        return {
          ...item,
          strategyIndex: index
        }
      })
    });
    setLoading(false);
    if (res.code === 1) {
      getBranchInfo();
      message.success('保存成功');
    } else {
      message.error(res.message);
    }
    return res;
  };

  const loadLatestVersion = async () => {
    setLoading(true);
    const res = await loadLatestVersionRuleBranch({
      appId: branchDetail.appId,
      sceneId: branchDetail.sceneId,
      branchId: branchDetail.branchId,
    });
    setLoading(false);
    if (res.code !== 1) {
      message.error(res.message);
      return false;
    }
    getBranchInfo();
    message.success('加载最新版本成功');
    return true;
  }

  const saveStable = async () => {
    let res;
    let content;

    if (codeMode) {
      res = validateString(sourceCode);
      if (res.code !== 1) {
        setTomlError(`${res.message}`);
        // message.error(res.message);
        return res;
      }
      content = TOML.stringify(formatString(sourceCode).data as JsonMap);
    } else {
      res = validateString(TOML.stringify(ruleObject));
      if (res.code !== 1) {
        setTomlError(`${res.formatMessage}`);
        // message.error(res.formatMessage);
        return res;
      }
      content = TOML.stringify(formatObject(ruleObject).data);
    }

    setLoading(true);
    res = await saveStableRuleBranch({
      appId: branchDetail.appId,
      sceneId: branchDetail.sceneId,
      branchId: branchDetail.branchId,
      ruleContent: content,
      branchVersionId: branchDetail.branchVersionId,
    });
    setLoading(false);
    if (res.code !== 1) {
      message.error(res.message);
      return false;
    }
    getBranchInfo();
    message.success('保存发布版本成功');
    return true;
  }

  const editBtn = () => {
    return branchDetail?.branchType === 1 && Number(listType) !== 1 ? (
      <BranchModalForm
        title={`修改分支基本信息`}
        initialValue={branchDetail}
        trigger={
          <Tooltip title="修改分支基本信息">
            <Button disabled={loading} className="button-right">
              <EditOutlined />
            </Button>
          </Tooltip>
        }
        onFinish={async (values) => {
          const result = await updateRuleBranch({
            ...values,
            branchId,
            appId,
            sceneId,
          });
          if (result.code === 1) {
            getBranchInfo();
            return true;
          }
          return false;
        }}
      />
    ) : null;
  };

  const saveBtnRelation = () => {
    const saveBtn = showSave && branchDetail.branchStatus === 100 && branchDetail.branchType !== 3 && listType && (
      <Button
        type="primary"
        className="right-button"
        onClick={onSaveContent}
      >
        保存
      </Button>
    );
    const saveStableBtn = branchDetail.branchStatus === 100 && branchDetail.branchType !== 0 && branchDetail.branchType !== 3 && listType && (
      <Popconfirm key='saveStableBtn' title="确认操作？" onConfirm={saveStable}>
        <Button
          type="primary"
          className="right-button"
        >
          保存发布版本
        </Button>
      </Popconfirm>
    );
    const loadLatestVersionBtn = branchDetail.branchStatus === 100 && branchDetail.branchType !== 0 && branchDetail.branchType !== 3 && listType && branchDetail.publishVersion !== branchDetail.baseVersion && (
      <Popconfirm key='saveStableBtn' title="此操作会替换本地草稿，请谨慎使用，确认操作？" onConfirm={loadLatestVersion}>
        <Button
          type="primary"
          className="right-button"
        >
          加载最新版本
        </Button>
      </Popconfirm>
    );

    return [saveBtn, saveStableBtn, loadLatestVersionBtn];
  }

  const renderStatusButton = () => {
    const dis = !checkRuleContent();
    const publishBtn = (
      <Popconfirm key='publishBtn' title="确认操作？" onConfirm={handlePublishRequest} disabled={dis}>
        <Button type="primary" style={{ float: 'right' }} disabled={dis}>提交发布单</Button>
      </Popconfirm>
    );
    const mergeBtn = (
      <Popconfirm key='mergeBtn' title="确认操作？" onConfirm={handleMergeRequest} disabled={dis}>
        <Button type="primary" style={{ float: 'right' }} disabled={dis}>合并</Button>
      </Popconfirm>
    );
    const stopBtn = (
      <Popconfirm key='stopBtn' title="确认操作？" onConfirm={handleStopRequest} disabled={dis}>
        <Button type="primary" style={{ float: 'right' }} disabled={dis}>下线</Button>
      </Popconfirm>
    );

    if (branchDetail?.branchType === 1) {
      if (Number(listType) === 0) {
        return [publishBtn];
      }
      return [mergeBtn, stopBtn];
    }
    return [];
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
      title: '发布版本',
      dataIndex: 'publishVersion',
      render: (dom, record) =>
        record.publishVersion === 0 ? (
          <span style={{ color: 'red' }}>初始版本</span>
        ) : (
          <span style={{ color: 'red' }}>{dom}</span>
        ),
    },
    {
      title: '基线版本',
      dataIndex: 'baseVersion',
      render: (dom, record) =>
        record.baseVersion === 0 ? (
          <span style={{ color: 'red' }}>初始版本</span>
        ) : (
          <span style={{ color: 'red' }}>{dom}</span>
        ),
    },
    {
      title: '内容版本',
      dataIndex: 'version',
      render: (dom, record) =>
        record.version === 0 ? (
          <span style={{ color: 'red' }}>初始版本</span>
        ) : (
          <span style={{ color: 'red' }}>{dom}</span>
        ),
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
            <div>
              <span>
                <h1>{branchDetail?.branchName}<span style={{color: 'red'}}>({RuleBranchType[branchDetail?.type || 1]})</span></h1>
              </span>
            </div>
          }
          extra={
            <Space size="small">
              {editBtn()}
              {saveBtnRelation()}
              {renderStatusButton()}
            </Space>
          }
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
          <Step1
            branchDetail={branchDetail}
            branchId={query.id || ''}
            onRefreshDetail={getBranchInfo}
            isEdit={listType}
            branchStrategyList={branchStrategyList}
            setBranchStrategyList={setBranchStrategyList}
            setLoading={setLoading}
            ruleObject={ruleObject}
            onSwitchCodeMode={onSwitchCodeMode}
            onSourceCodeChange={onSourceCodeChange}
            onGroupsFormChange={onGroupsFormChange}
            codeMode={codeMode}
            sourceCode={sourceCode}
            tomlError={tomlError}
            // bpms={bpms}
            // changeMergeRequestDisabled={(isDisabled: boolean) => setMergeRequestDisabled(isDisabled)}
          />
        </Card>
      </Spin>
      <CreatePublishResult
        visible={createPublishResultModalVisible}
        onVisibleChange={setCreatePublishResultModalVisible}
        apiResult={apiResult}
      />
    </PageContainer>
  );
};

export default UpdateView;
