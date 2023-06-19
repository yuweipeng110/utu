import React, { useEffect, useState } from 'react';
import { connect, history } from 'umi';
import type { ConnectProps } from 'umi';
import { ConnectState } from '@/models/connect';
import { Button, Form, message, Space, Spin, Popconfirm } from 'antd';
import ProForm from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import ProDescriptions, { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import { addFlowContent, getFlowDetail } from '@/services/flow';
import { AppInfo } from '@/models/app';
import { FlowInfo } from '@/models/flow';
import MonacoEditor from 'react-monaco-editor';
import { EditorCodeTheme } from '@/utils/func';
import '../index.less';
import _ from 'lodash';

export type EditFlowProps = {
  location: any;
  currentApp?: AppInfo;
} & Partial<ConnectProps>;

const EditFlow: React.FC<EditFlowProps> = (props) => {
  const {
    location: { query },
    currentApp,
  } = props;
  const appId = currentApp?.id;
  const flowId = query.id;
  const version = query.version;
  const [form] = Form.useForm();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentFlowData, setCurrentFlowData] = useState<FlowInfo>(Object.create(null));
  const [sourceCode, setSourceCode] = useState<string>('');

  const loadFlowInfo = async () => {
    setIsLoading(true);
    const params: any = {
      flowId: Number(flowId),
    };
    if (version) {
      params.version = Number(version);
    }
    const res = await getFlowDetail(params);
    setIsLoading(false);
    if (!res) {
      history.push('/error');
      return;
    }
    setCurrentFlowData(res);
    setSourceCode(res.content);
  };

  useEffect(() => {
    if (flowId) {
      loadFlowInfo();
    }
  }, [flowId]);

  useEffect(() => {
    if (Number(currentApp?.id) !== Number(appId)) {
      message.error('应用发生改变，请重新选择策略');
      history.push('/knowledge/flow');
    }
  }, [currentApp]);

  const onEditorChange = (value: any, ev: any) => {
    setSourceCode(value);
  };

  // 一键导入模版，脚本式规则集
  const autoImportTemplate = async () => {
    if (_.isEmpty(currentFlowData)) {
      return false;
    }
    const desc = currentFlowData.description;
    setSourceCode('');
    const sourceCodeContent = `namespace = ""\ndescription = "${desc}"\nversion = 1\n\n[[node]]\nname = "start"\ndescription = "开始节点"\ntype = "start"\nexecute = ""\nnext = ["split1"]\n\n[[node]]\nname = "split1"\ndescription = "分流节点"\ntype = "split"\nexecute = "com.amap.utu.amap-security-account.submit_order.default.split1#rule1"\nnext = ["rs1", "rs2"]\n\n[[node]]\nname = "rs1"\ndescription = "rs1策略节点"\ntype = "ruleset"\nexecute = "com.amap.utu.amap-security-account.submit_order.default.ruleset1#*"\nnext = ["rs2"]\n\n[[node]]\nname = "rs2"\ndescription = "rs2策略节点"\ntype = "ruleset"\nexecute = "com.amap.utu.amap-security-account.submit_order.default.ruleset2#*"\nnext = ["end"]\n\n[[node]]\nname = "end"\ndescription = "结束节点"\ntype = "end"\nexecute = ""\nnext = []`;
    setSourceCode(sourceCodeContent);
    return true;
  };

  const save = async () => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在保存...', key: loadingKey, duration: 0 });
    const params = {
      appId: Number(appId),
      ruleFlowId: Number(flowId),
      version: currentFlowData.version,
      content: sourceCode,
    };
    setIsLoading(true);
    const res = await addFlowContent(params);
    setIsLoading(false);
    if (res.code !== 1) {
      message.error({ content: res.message, key: loadingKey, duration: 2 });
      return false;
    }
    message.success({ content: '保存成功!', key: loadingKey, duration: 2 });
    loadFlowInfo();
    return true;
  };

  const editColumns: ProDescriptionsItemProps<FlowInfo>[] = [
    {
      title: '名称',
      dataIndex: 'name',
    },
    {
      title: '版本',
      dataIndex: 'version',
      render: (dom, record) => {
        if (record.version === 0) {
          return '-';
        }
        return <span style={{ color: 'red' }}>V{dom}</span>;
      },
    },
    {
      title: '修改人',
      dataIndex: 'modifyUser',
    },
    {
      title: '修改时间',
      dataIndex: 'modifyTime',
      valueType: 'dateTime',
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
    },
  ];

  return (
    <PageContainer>
      <Spin spinning={isLoading} size="large">
        <ProCard
          title="编辑决策流"
          headerBordered
          extra={
            !version && (
              <Space>
                <Button type="primary" onClick={save}>
                  保存
                </Button>
              </Space>
            )
          }
        >
          <ProForm form={form} submitter={false} layout="inline">
            <Space size="large" direction="vertical" style={{ width: '100%' }}>
              <ProDescriptions
                bordered
                column={3}
                title={false}
                dataSource={currentFlowData}
                columns={editColumns}
                style={{ width: '100%' }}
                size="small"
              />
              <ProCard
                title={
                  <div>
                    <span>决策流内容</span>
                    {/* <span style={{ color: 'red', display: 'block' }}>{tomlError}</span> */}
                  </div>
                }
                extra={
                  !version && (
                    <Popconfirm
                      key="resetBtn"
                      title="一键导入模版会替换当前内容，确认操作？"
                      onConfirm={autoImportTemplate}
                    >
                      <Button type="primary">一键导入模版</Button>
                    </Popconfirm>
                  )
                }
              >
                <MonacoEditor
                  value={sourceCode}
                  width="100%"
                  height={700}
                  onChange={onEditorChange}
                  // editorDidMount={handleEditorDidMount}
                  theme={EditorCodeTheme}
                  options={{
                    readOnly: false,
                    renderWhitespace: 'boundary',
                    scrollbar: {
                      alwaysConsumeMouseWheel: false,
                    },
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                  }}
                  language="go"
                />
              </ProCard>
            </Space>
          </ProForm>
        </ProCard>
      </Spin>
    </PageContainer>
  );
};

export default connect(({ app }: ConnectState) => ({
  currentApp: app.currentApp,
}))(EditFlow);
