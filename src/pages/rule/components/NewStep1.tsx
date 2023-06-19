import React, { useImperativeHandle, useMemo, useState } from 'react';
import { connect, history } from 'umi';
import { Button, Affix, Tooltip, Select, Space, message, Popconfirm, Empty, Alert } from 'antd';
import { CodeOutlined, CodeFilled } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import type { ConnectState } from '@/models/connect';
import type { BranchDetail, BranchStage } from '@/models/rule';
import { StrategyRuleRelation } from '@/models/strategy';
import {
  branchDifferentVersionDiffWith,
  closeRuleBranch,
  loadLatestVersionRuleBranch,
  saveRuleContent,
} from '@/services/rule';
import { submitPublishOrder } from '@/services/publish';
import {
  allCollapsedLength,
  allExpand,
  allCollapse,
  EditorCodeTheme,
  handleEditorCodeTheme,
  CodeThemeList,
} from '@/utils/func';
import RuleCodeEditor from './RuleCodeEditor';
import RuleFormEditor from './FormEditor/RuleFormEditor';
import CreatePublishResult from '@/pages/publish/components/Modal/CreatePublishResult';
import TOML from '@iarna/toml';
import type { JsonMap } from '@iarna/toml';
import {
  formatStringPackage,
  formatStagesPackage,
  formatString,
  formatObject,
  validateString,
} from '@/utils/tomlUtils';
import { MonacoDiffEditor } from 'react-monaco-editor';
import Placeholder from './LazyLoad/Placeholder';
import '../index.less';
import _ from 'lodash';
import { getPageQuery } from '@/utils/utils';

const { Option } = Select;

export type StepProps = {
  refInstance?: any;
  branchDetail: BranchDetail; //分支详情
  branchId: number; //分支ID
  onRefreshEditDetail?: () => void; //刷新edit详情内容
  isEdit: any; //是否可以编辑
  branchStrategyList: StrategyRuleRelation[]; //分支策略关联list
  setBranchStrategyList: (branchStrategyList: StrategyRuleRelation[]) => void; //设置分支策略关联list
  oldBranchStrategyList: StrategyRuleRelation[]; //原始分支策略关联list
  setLoading: (isLoading: boolean) => void; //是否加载中
  isEditMode: boolean; //是否为编辑模式
  currentTab: string;
  setCurrentTab: any;
  editTabList: any;
  setRuleObject?: any;
  ruleObject?: any;
  onlineBranchDetail?: any;
  editBranchInfoOnline?: any;
};

let NewStep1 = (props: StepProps) => {
  const {
    refInstance,
    branchDetail,
    branchId,
    onRefreshEditDetail,
    isEdit,
    branchStrategyList,
    setBranchStrategyList,
    oldBranchStrategyList,
    setLoading,
    isEditMode,
    currentTab,
    setCurrentTab,
    editTabList,
    setRuleObject,
    ruleObject,
    onlineBranchDetail,
    editBranchInfoOnline,
  } = props;

  const queryParams = getPageQuery();
  const appId = queryParams['app_id'];
  const sceneId = queryParams['scene_id'];
  const listType = queryParams['list_type'];
  const accessMode = queryParams['access_mode'];

  const [draftSourceCode, setDraftSourceCode] = useState<string>('');
  const [sourceCode, setSourceCode] = useState<string>('');
  const [codeMode, setCodeMode] = useState<boolean>(false);
  const [editorLoading, setEditorLoading] = useState<boolean>(false);
  const [tomlError, setTomlError] = useState<string>('');
  const [codeTheme, setCodeTheme] = useState<string | any>(EditorCodeTheme);
  const [visualMode, setVisualMode] = useState<boolean>(true);
  const [diffOnlineContent, setDiffOnlineContent] = useState<string>('');
  // 提交发布单结果相关state
  const [createPublishResultModalVisible, setCreatePublishResultModalVisible] =
    useState<boolean>(false);
  const [apiResult, setApiResult] = useState(Object.create(null));
  // diffEditor
  const [diffEditorLoading, setDiffEditorLoading] = useState<boolean>(false);
  // 分支类型： master、对照组， OR isEdit： 1
  const readOnly =
    branchDetail?.branchType === 0 || branchDetail?.branchType === 3 || Number(isEdit) === 1;

  // 暴露给父组件的方法
  useImperativeHandle(refInstance, () => ({
    onSaveContent,
  }));

  const createPublishResultSwitch = (modalStatus: boolean, result: any) => {
    setApiResult(result);
    setCreatePublishResultModalVisible(true);
  };

  const loadDiffRequest = async () => {
    const res = await branchDifferentVersionDiffWith({
      appId: branchDetail.appId,
      sceneId: branchDetail.sceneId,
      currentBranchId: branchDetail.branchId,
    });
    if (res.code !== 1) {
      message.error(res.message);
      return false;
    }
    setDiffOnlineContent(res.data.currentContent || '');
    return true;
  };

  const onSwitchVisualMode = () => {
    setVisualMode(!visualMode);
  };

  const onRefresh = async () => {
    if (onRefreshEditDetail) {
      onRefreshEditDetail();
    }
  };

  const onRefreshOnline = async () => {
    if (editBranchInfoOnline) {
      await editBranchInfoOnline();
    }
  };

  /**
   * 发布
   */
  const handlePublishRequest = async () => {
    if (!checkRuleContent()) {
      message.error(`提交发布单失败：规则内容不允许为空`);
      return false;
    }
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在提交发布单...', key: loadingKey, duration: 0 });

    let res;
    let content;

    // if(!_.isEmpty(branchStrategyList) && !_.isEmpty(ruleObject.stages) && branchStrategyList.length !== ruleObject.stages.length) {
    //   message.error({ content: '策略不能重复引用，请检查是否引入重复策略', key: loadingKey, duration: 2 });
    //   return false;
    // }
    if (codeMode) {
      res = validateString(sourceCode);
      if (res.code !== 1) {
        setTomlError(`${res.message}`);
        message.error({ content: res.message, key: loadingKey, duration: 2 });
        return res;
      }
      content = TOML.stringify(formatString(sourceCode).data as JsonMap);
    } else {
      res = validateString(TOML.stringify(ruleObject));
      if (res.code !== 1) {
        setTomlError(`${res.formatMessage}`);
        message.error({ content: res.formatMessage, key: loadingKey, duration: 2 });
        return res;
      }
      content = TOML.stringify(formatObject(ruleObject).data);
    }
    setLoading(true);
    res = await submitPublishOrder({
      appId: branchDetail.appId,
      sceneId: branchDetail.sceneId,
      source: 1,
      id: branchId,
      branchType: branchDetail.branchType,
      // 分支保存参数
      dto: {
        branchId: branchDetail.branchId,
        ruleContent: content,
        branchStrategyList: branchStrategyList.map((item, index) => {
          return {
            ...item,
            strategyIndex: index,
          };
        }),
        branchVersionId: branchDetail.branchVersionId,
      },
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

  const handleCloseRequest = async () => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在关闭...', key: loadingKey, duration: 0 });
    setLoading(true);
    const res = await closeRuleBranch({
      appId: branchDetail.appId,
      sceneId: branchDetail.sceneId,
      branchId: branchDetail.branchId,
    });
    setLoading(false);
    if (res.code !== 1) {
      message.error({ content: res.message, key: loadingKey, duration: 2 });
      return false;
    }
    onRefresh();
    message.success({ content: '关闭成功!', key: loadingKey, duration: 2 });
    // 跳转分支详情页
    history.push(
      `/scene/rule/detail?id=${branchId}&app_id=${appId}&scene_id=${sceneId}&list_type=${listType}&access_mode=${accessMode}`,
    );
    return true;
  };

  const handleLoadNewRequest = async () => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在加载...', key: loadingKey, duration: 0 });
    setLoading(true);
    const res = await loadLatestVersionRuleBranch({
      appId: branchDetail.appId,
      sceneId: branchDetail.sceneId,
      branchId: branchDetail.branchId,
    });
    setLoading(false);
    if (res.code !== 1) {
      message.error({ content: res.message, key: loadingKey, duration: 2 });
      return false;
    }
    onRefresh();
    message.success({ content: '加载成功!', key: loadingKey, duration: 2 });
    return true;
  };

  const onSaveContent = async () => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在保存...', key: loadingKey, duration: 0 });

    let res;
    let content;

    // if(!_.isEmpty(branchStrategyList) && !_.isEmpty(ruleObject.stages) && branchStrategyList.length !== ruleObject.stages.length) {
    //   message.error({ content: '策略不能重复引用，请检查是否引入重复策略', key: loadingKey, duration: 2 });
    //   return false;
    // }
    if (codeMode) {
      res = validateString(sourceCode, !visualMode);
      if (res.code !== 1) {
        setTomlError(`${res.message}`);
        message.error({ content: res.message, key: loadingKey, duration: 2 });
        return res;
      }
      content = TOML.stringify(formatString(sourceCode).data as JsonMap);
    } else {
      res = validateString(TOML.stringify(ruleObject), !visualMode);
      if (res.code !== 1) {
        setTomlError(`${res.formatMessage}`);
        message.error({ content: res.formatMessage, key: loadingKey, duration: 2 });
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
      branchStrategyList: branchStrategyList.map((item, index) => {
        return {
          ...item,
          strategyIndex: index,
        };
      }),
      branchVersionId: branchDetail.branchVersionId,
    });
    setLoading(false);
    if (res.code !== 1) {
      message.error({ content: res.message, key: loadingKey, duration: 2 });
      return false;
    }
    message.success({ content: '保存成功!', key: loadingKey, duration: 2 });
    onRefresh();
    return true;
  };

  useMemo(() => {
    setRuleObject({ stages: branchDetail?.ruleGroups });
    setSourceCode(branchDetail?.ruleContent);
    // 草稿
    setDraftSourceCode(branchDetail?.ruleContent);
  }, [branchDetail]);

  useMemo(() => {
    if (!isEditMode) {
      setCurrentTab(editTabList[0]);
    } else {
      setCurrentTab(editTabList[1]);
    }
  }, [isEditMode]);

  useMemo(() => {
    setVisualMode(_.isEmpty(branchStrategyList));
  }, [branchStrategyList]);

  const onRefreshGroups = () => {
    const tomlData = TOML.parse(sourceCode);
    const tmpRuleGroups = tomlData?.stages as BranchStage[];
    setRuleObject({ stages: tmpRuleGroups });
  };

  const onSwitchCodeMode = () => {
    if (!codeMode) {
      setSourceCode(TOML.stringify(formatObject(ruleObject).data));
      //草稿
      setDraftSourceCode(TOML.stringify(formatObject(ruleObject).data));
    } else {
      onRefreshGroups();
    }
    setCodeMode(!codeMode);
  };

  const onSourceCodeChange = (value: string) => {
    setSourceCode(value);
    //草稿
    setDraftSourceCode(value);
    setTomlError('');
  };

  const onGroupsFormChange = async (groups: BranchStage[]) => {
    setRuleObject({ ...ruleObject, stages: groups });
    setTomlError('');
  };

  /**
   * 格式化旧数据，添加packageName属性，注：sourceCode模式下无法转换！
   */
  const formatOldData = () => {
    let content;
    if (!codeMode) {
      content = TOML.stringify(formatObject(ruleObject).data);
    }
    const handleRes: any = formatStringPackage(content, oldBranchStrategyList);
    const handleDataRes: any = TOML.stringify(handleRes.data as JsonMap);
    if (handleRes.code !== 1) {
      message.error(handleDataRes.message);
      return false;
    }
    // setSourceCode(handleRes.data);
    setRuleObject({
      stages: formatStagesPackage(
        TOML.parse(content)?.stages as BranchStage[],
        oldBranchStrategyList,
      ),
    });
    message.success('转换成功');
    setTomlError('');
    return true;
  };

  const renderAllCollapsedBtn = () => {
    if (!ruleObject?.stages) {
      return false;
    }
    const rulesLength = allCollapsedLength(ruleObject);
    if (rulesLength !== -1) {
      return (
        <Tooltip title="展开全部">
          <Button
            className="right-button"
            style={{ marginRight: '5px' }}
            onClick={() => {
              allExpand(ruleObject, onGroupsFormChange);
            }}
          >
            <CodeOutlined style={{ fontSize: 18 }} />
          </Button>
        </Tooltip>
      );
    }
    return (
      <Tooltip title="收起全部">
        <Button
          className="right-button"
          style={{ marginRight: '5px' }}
          onClick={() => {
            allCollapse(ruleObject, onGroupsFormChange);
          }}
        >
          <CodeFilled style={{ fontSize: 18 }} />
        </Button>
      </Tooltip>
    );
  };

  const renderRuleTitle = () => {
    return (
      <div className="title">
        <Tooltip title="编辑器主题">
          <Select
            style={{ width: 180, marginRight: '5px' }}
            defaultValue={codeTheme}
            onSelect={(value) => {
              handleEditorCodeTheme(value, setCodeTheme);
            }}
          >
            {CodeThemeList.map((item) => (
              <Option key={item.value} value={item.value}>
                {item.name}
              </Option>
            ))}
          </Select>
        </Tooltip>
        {currentTab !== editTabList[3] && (
          <>
            {renderAllCollapsedBtn()}
            <Button
              type={codeMode ? 'primary' : 'default'}
              className="right-button"
              onClick={onSwitchCodeMode}
            >
              Source Code
            </Button>
          </>
        )}
      </div>
    );
  };

  const renderRuleTitleStage = () => {
    return (
      <Affix>
        <div className="title-stage">
          <div className="title-tips">
            {/*<h3>规则内容</h3>*/}
            <h3>{!isEditMode ? '分支详情' : '编辑分支'}</h3>
            {/*<span style={{ color: 'red', display: 'block', overflow: 'auto' }}>{tomlError}</span>*/}
          </div>
          {renderRuleTitle()}
        </div>
      </Affix>
    );
  };

  /**
   * render分支规则内容
   *
   * @param contentType
   *    内容类型：0:明细、1：草稿、2：线上
   */
  const renderRuleContent = (contentType: number) => {
    const currentReadOnly = contentType === 0 || contentType === 2 ? true : readOnly;
    let currentSourceCode: any;
    let currentRuleGroups: any;
    if (contentType === 1) {
      // 草稿
      currentSourceCode = draftSourceCode;
      currentRuleGroups = ruleObject.stages;
    }
    if (contentType === 2) {
      try {
        if (onlineBranchDetail.publishContent) {
          currentSourceCode = TOML.stringify(
            formatObject(TOML.parse(onlineBranchDetail.publishContent)).data,
          );
          currentRuleGroups = TOML.parse(onlineBranchDetail.publishContent).stages as BranchStage[];
        }
      } finally {
      }
    } else {
      currentSourceCode = sourceCode;
      currentRuleGroups = ruleObject.stages;
    }

    // 判断 详情页 内容为空显示Empty
    if (contentType === 0 && _.isEmpty(branchDetail.ruleContent)) {
      return <Empty />;
    }
    // 判断 线上 内容为空显示Empty
    if (contentType === 2 && _.isEmpty(branchDetail.publishContent)) {
      return <Empty />;
    }
    return (
      <div>
        <span style={{ color: 'red', display: 'block', overflow: 'auto' }}>{tomlError}</span>
        <div>
          {codeMode ? (
            <RuleCodeEditor
              readOnly={currentReadOnly}
              sourceCode={currentSourceCode}
              onValueChange={onSourceCodeChange}
              codeTheme={codeTheme}
              visualMode={visualMode}
            />
          ) : (
            <RuleFormEditor
              readOnly={currentReadOnly}
              branchId={branchId}
              ruleGroups={currentRuleGroups}
              onChange={onGroupsFormChange}
              codeTheme={codeTheme}
              branchStrategyList={branchStrategyList}
              setBranchStrategyList={setBranchStrategyList}
              visualMode={visualMode}
            />
          )}
        </div>
      </div>
    );
  };

  const renderRuleDetailContent = () => {
    return <>{renderRuleContent(0)}</>;
  };

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
  };

  const renderCloneButton = () => {
    const clearButton = (
      <Popconfirm
        key="clearButton"
        title="此操作会删除本地草稿，确认操作？"
        onConfirm={handleCloseRequest}
      >
        <Button type="primary">关闭</Button>
      </Popconfirm>
    );
    return clearButton;
  };

  const renderDraftButton1 = () => {
    const dis = !checkRuleContent();
    const handleDataBtn =
      !visualMode && !codeMode && branchStrategyList && branchStrategyList.length > 0 ? (
        <Button key="handleDataBtn" type="primary" onClick={formatOldData}>
          分支升级
        </Button>
      ) : (
        <></>
      );
    const visualButton =
      !readOnly &&
      (visualMode ? (
        <Button
          key="visualButton"
          type={visualMode ? 'primary' : 'default'}
          onClick={onSwitchVisualMode}
          style={{ marginRight: '5px' }}
          disabled={!_.isEmpty(ruleObject.stages) && _.isEmpty(branchStrategyList.length)}
        >
          切换可视化界面
        </Button>
      ) : (
        <Button
          key="visualButton"
          type={visualMode ? 'primary' : 'default'}
          onClick={onSwitchVisualMode}
          style={{ marginRight: '5px' }}
          disabled={!_.isEmpty(branchStrategyList)}
        >
          切换默认界面
        </Button>
      ));
    const saveButton = (
      <Button key="saveButton" type="primary" onClick={onSaveContent}>
        保存
      </Button>
    );
    const publishButton = (
      <Popconfirm
        key="publishBtn"
        title="确认操作？"
        onConfirm={handlePublishRequest}
        disabled={dis}
      >
        <Button type="primary" disabled={dis}>
          发布
        </Button>
      </Popconfirm>
    );
    return [handleDataBtn, visualButton, renderCloneButton(), saveButton, publishButton];
  };

  const renderDraftButton2 = () => {
    const loadNewButton = (
      <Tooltip key="loadNewButton" title="此操作会覆盖本地的草稿内容">
        <Button type="primary" onClick={handleLoadNewRequest}>
          加载最新
        </Button>
      </Tooltip>
    );
    return [renderCloneButton(), loadNewButton];
  };

  const renderDraftButton = () => {
    return (branchDetail.publishVersion || 0) === (branchDetail.baseVersion || 0)
      ? renderDraftButton1()
      : renderDraftButton2();
  };

  const renderRuleEditContent = () => {
    return (
      <>
        <ProCard
          // bordered
          className="rule-step1-card"
          tabs={{
            type: 'card',
            activeKey: currentTab,
            animated: true,
            onChange: async (activeKey) => {
              setCurrentTab(activeKey);
              if (activeKey === editTabList[2]) {
                setEditorLoading(true);
                await onRefreshOnline();
                setEditorLoading(false);
              } else if (activeKey === editTabList[3]) {
                setDiffEditorLoading(true);
                if (!codeMode) {
                  await setSourceCode(TOML.stringify(formatObject(ruleObject).data));
                }
                await loadDiffRequest();
                setDiffEditorLoading(false);
                // onEditorResize();
              }
            },
            // tabBarExtraContent: <Space size="small" style={{marginRight: 20}}>{renderRuleTitle()}</Space>
          }}
        >
          <ProCard.TabPane
            key={editTabList[1]}
            tab="草稿"
            cardProps={{
              extra: <Space size="small">{renderDraftButton()}</Space>,
            }}
          >
            {currentTab === editTabList[1] && (
              <>
                {renderRuleContent(1)}
                <CreatePublishResult
                  visible={createPublishResultModalVisible}
                  onVisibleChange={setCreatePublishResultModalVisible}
                  apiResult={apiResult}
                />
              </>
            )}
          </ProCard.TabPane>
          <ProCard.TabPane key={editTabList[2]} tab="线上">
            <Alert
              message="新建时显示为master内容"
              type="info"
              showIcon
              closable
              style={{ marginTop: 15 }}
            />
            {currentTab === editTabList[2] && !editorLoading ? (
              <div style={{ paddingTop: 20 }}>{renderRuleContent(2)}</div>
            ) : (
              <Placeholder />
            )}
          </ProCard.TabPane>
          <ProCard.TabPane key={editTabList[3]} tab="草稿与线上diff">
            {currentTab === editTabList[3] && !diffEditorLoading ? (
              <div style={{ paddingTop: 20 }}>
                <div style={{ padding: 10, display: 'flex', justifyContent: 'space-around' }}>
                  <div>草稿内容</div>
                  <div>线上内容</div>
                </div>
                <MonacoDiffEditor
                  original={sourceCode || ''}
                  value={diffOnlineContent || ''}
                  width="100%"
                  height={600}
                  theme={codeTheme}
                  options={{
                    readOnly: true,
                    renderWhitespace: 'boundary',
                    scrollbar: {
                      alwaysConsumeMouseWheel: false,
                    },
                    scrollBeyondLastLine: false,
                    // automaticLayout: true,
                    // folding: false,
                    wordWrap: 'on',
                  }}
                  language="go"
                />
              </div>
            ) : (
              <Placeholder />
            )}
          </ProCard.TabPane>
        </ProCard>
      </>
    );
  };

  return (
    <ProCard bordered className="rule-card">
      {renderRuleTitleStage()}
      {isEditMode ? renderRuleEditContent() : renderRuleDetailContent()}
    </ProCard>
  );
};

NewStep1 = connect(({ app }: ConnectState) => ({
  currentApp: app.currentApp,
}))(NewStep1);
export default React.forwardRef((props: StepProps, ref) => (
  <NewStep1 {...props} refInstance={ref} />
));

// export default connect(({ app }: ConnectState) => ({
//   currentApp: app.currentApp,
// }))(NewStep1);
