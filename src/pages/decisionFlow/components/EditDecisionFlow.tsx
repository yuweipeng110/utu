import React, { useState, useEffect, useRef } from 'react';
import { connect, history, Prompt } from 'umi';
import type { ConnectProps } from 'umi';
import { ConnectState } from '@/models/connect';
import { PageContainer } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import ProDescriptions from '@ant-design/pro-descriptions';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Divider, message, Popover, Space, Spin, Modal, Form } from 'antd';
import { AppInfo } from '@/models/app';
import {
  addFlowContent,
  getFlowDetail,
  getFlowVersionList,
  previewFlowUtrl,
} from '@/services/flow';
import { FlowInfo } from '@/models/flow';
import Dag from './AntvX6';
import ViewCode from '@/components/Modal/ViewCode';
import PasteFlow from './AntvX6/components/ModalForm/PasteFlow';
import _ from 'lodash';
import '../index.less';
import ProForm, { ProFormSelect } from '@ant-design/pro-form';

type EditDecisionFlowProps = {
  title: string;
  currentApp?: AppInfo;
  location: any;
} & Partial<ConnectProps>;

const EditDecisionFlow: React.FC<EditDecisionFlowProps> = (props) => {
  // export default (props: EditDecisionFlowProps & { location: { query: any } }) => {
  const {
    location: { query },
    currentApp,
  } = props;
  const appId = query.app_id;
  const flowId = query.id;
  const version = query.version;
  const appExperimentGroupId = query.app_experiment_group_id;

  const graphRef = useRef<any>();
  const [form] = Form.useForm();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentFlowData, setCurrentFlowData] = useState<FlowInfo>(Object.create(null));
  const [flowVersionList, setFlowVersionList] = useState([]);
  // 决策流预览相关state
  const [previewFlowModalVisible, setPreviewFlowModalVisible] = useState<boolean>(false);
  const [previewSourceCode, setPreviewSourceCode] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  // 决策流粘贴相关state
  const [pasteFlowModalVisible, setPasteFlowModalVisible] = useState<boolean>(false);

  const loadFlowDataRequest = async () => {
    const params: any = {
      flowId: Number(flowId),
      appExperimentGroupId: Number(appExperimentGroupId),
    };
    if (version) {
      params.version = Number(version);
    }
    const res = await getFlowDetail(params);
    if (!res) {
      history.push('/error');
      return;
    }
    setCurrentFlowData(res);
    return res;
  };

  const getFlowVersionListRequest = async () => {
    const res = await getFlowVersionList({
      flowId: Number(flowId),
    });
    setFlowVersionList(res);
  };

  const refreshCurrent = async () => {
    setIsLoading(true);
    await loadFlowDataRequest();
    await getFlowVersionListRequest();
    setIsLoading(false);
  };

  useEffect(() => {
    refreshCurrent();
  }, []);

  useEffect(() => {
    if (!_.isEmpty(currentFlowData)) {
      form.setFieldsValue({ flowVersion: currentFlowData.version });
    }
  }, [currentFlowData]);

  /**
   * 切换决策流版本
   */
  const switchFlowVersion = async (rowVersion: number) => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在切换决策流版本...', key: loadingKey, duration: 0 });
    const params: any = {
      flowId: Number(flowId),
      appExperimentGroupId: Number(appExperimentGroupId),
      version: rowVersion,
    };
    setIsLoading(true);
    const res = await getFlowDetail(params);
    if (!res) {
      message.error({ content: '切换失败！请重试', key: loadingKey, duration: 2 });
      return;
    }
    setCurrentFlowData(res);
    graphRef.current?.FlowGraph.initGraphShape(JSON.parse(res.content));
    // 处理isReadOnly 因切换版本需把isReadOnly置为false
    if (
      !_.isEmpty(graphRef.current.instance) &&
      res.version !== Math.max(...flowVersionList)
    ) {
      graphRef.current.FlowGraph.handleReadOnlyData(JSON.parse(res.content), false);
    }
    message.success({ content: '切换成功!', key: loadingKey, duration: 2 });
    setIsLoading(false);
  };

  const previewFlowModalStatusSwitch = async (modalStatus: boolean) => {
    setPreviewFlowModalVisible(modalStatus);
    setPreviewLoading(true);
    const res = await previewFlowUtrl({
      ruleFlowId: Number(flowId),
      appId: Number(appId),
      graphJSON: JSON.stringify(graphRef.current?.instance.toJSON()),
    });
    setPreviewLoading(false);
    if (res.code !== 1) {
      message.error(res.message);
      setPreviewFlowModalVisible(false);
      return false;
    }
    setPreviewSourceCode(res.data);
    return true;
  };

  const saveRequest = async () => {
    const graphObjJSON = graphRef.current?.instance.toJSON();
    let [nodes, edges]: any = [[], []];
    graphObjJSON?.cells.map((item: any) => {
      if (item.source && item.target) {
        edges.push(item);
      } else {
        nodes.push(item);
      }
    });
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在保存...', key: loadingKey, duration: 0 });
    const params = {
      appId: Number(appId),
      ruleFlowId: Number(flowId),
      version: Math.max(...flowVersionList) | 0,
      graphJSON: JSON.stringify(graphObjJSON),
      nodes,
      edges,
    };
    setIsLoading(true);
    const res = await addFlowContent(params);
    setIsLoading(false);
    if (res.code !== 1) {
      message.error({ content: res.message, key: loadingKey, duration: 2 });
      return false;
    }
    message.success({ content: '保存成功!', key: loadingKey, duration: 2 });
    refreshCurrent();
    // 处理isReadOnly
    if (!_.isEmpty(graphRef.current.instance)) {
      graphRef.current.FlowGraph.handleReadOnlyData(graphObjJSON, true);
    }
    return true;
  };

  const columns: any = [
    {
      title: '圆形',
      render: () => '开始、结束节点，只标识流程开始、结束',
    },
    {
      title: '菱形',
      render: () => '实验分流节点，代表开始分流操作',
    },
    {
      title: '长方形',
      render: () => '普通策略节点',
    },
    {
      title: '三角形',
      render: () => '选择策略节点',
    },
    {
      title: '实线',
      render: () => '有向线段，链接各个节点的连线',
    },
    {
      title: '虚线',
      render: () => '有向线段，实验分组的连线，有实验相关信息',
    },
    {
      title: '点虚线',
      render: () => '有向线段，选择分组的连线',
    },
  ];

  return (
    <PageContainer>
      <Spin spinning={isLoading} tip="数据加载中，请稍后...">
        <ProCard
          title={
            !_.isEmpty(currentFlowData) && (
              <>
                编辑决策流
                <Divider type="vertical" />
                {currentFlowData?.name || ''}
              </>
            )
          }
          headerBordered
          extra={
            // !_.isEmpty(graphRef.current) && !_.isEmpty(graphRef.current.instance) &&
            !appExperimentGroupId &&
            !version && (
              <ProForm
                form={form}
                submitter={{
                  render: () => null,
                }}
                layout="inline"
              >
                <Space>
                  {flowVersionList.length > 0 && (
                    <ProFormSelect
                      name="flowVersion"
                      options={flowVersionList.map((item) => {
                        return {
                          value: Number(item),
                          label: `V${item}`,
                        };
                      })}
                      initialValue={currentFlowData.version}
                      fieldProps={{
                        allowClear: false,
                        size: 'small',
                        onChange: (value) => switchFlowVersion(value),
                      }}
                    />
                  )}
                  <Popover
                    content={
                      <ProDescriptions
                        bordered
                        column={1}
                        title={false}
                        columns={columns}
                        style={{ width: '100%', fontSize: '10px' }}
                        size="small"
                      />
                    }
                  >
                    <QuestionCircleOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
                  </Popover>
                  <Button
                    type="primary"
                    onClick={() => {
                      let textField = document.createElement('textarea');
                      const copyJson = {
                        appId: Number(appId),
                        domain: document.domain,
                        flowCells: graphRef.current.instance.toJSON(),
                      };
                      textField.innerText = JSON.stringify(copyJson);
                      document.body.appendChild(textField);
                      textField.select();
                      document.execCommand('Copy');
                      message.success('拷贝成功！');
                    }}
                  >
                    拷贝
                  </Button>
                  <Button type="primary" onClick={() => setPasteFlowModalVisible(true)}>
                    粘贴
                  </Button>
                  <Button type="primary" onClick={() => previewFlowModalStatusSwitch(true)}>
                    预览
                  </Button>
                  <Button type="primary" onClick={saveRequest}>
                    保存
                  </Button>
                </Space>
              </ProForm>
            )
          }
          className="edit-flow-pro-card"
        >
          <Dag ref={graphRef} currentFlowData={currentFlowData} isDisabled={false} />
        </ProCard>
        <Prompt
          when={true}
          message={(location, action) => {
            if (action === 'POP') {
              return `离开当前页后，所编辑的数据将不可恢复`;
            }
            return true;
          }}
        />
      </Spin>
      <ViewCode
        visible={previewFlowModalVisible}
        onVisibleChange={setPreviewFlowModalVisible}
        sourceCode={previewSourceCode}
        previewLoading={previewLoading}
      />
      <PasteFlow
        FlowGraph={graphRef.current?.FlowGraph}
        visible={pasteFlowModalVisible}
        onVisibleChange={setPasteFlowModalVisible}
        currentApp={currentApp}
      />
    </PageContainer>
  );
};

export default connect(({ app }: ConnectState) => ({
  currentApp: app.currentApp,
}))(EditDecisionFlow);
