import { ModalForm, ProFormTextArea } from '@ant-design/pro-form';
import { Form, message } from 'antd';
import _ from 'lodash';

export type PasteFlowProps = {
  FlowGraph: any;
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  currentApp: any;
};

const PasteFlow: React.FC<PasteFlowProps> = (props) => {
  const { FlowGraph, visible, onVisibleChange, currentApp } = props;
  const [form] = Form.useForm();

  const onSubmit = (values: any) => {
    const copyJson = JSON.parse(values.text);

    const loadingKey = 'loadingKey';
    message.loading({ content: '正在粘贴...', key: loadingKey, duration: 0 });
    if (!_.isEmpty(copyJson) && copyJson.appId !== currentApp.id || copyJson.domain !== document.domain) {
      message.error({ content: `粘贴失败，粘贴内容不在当前应用下`, key: loadingKey, duration: 2 });
      return false;
    }
    try {
      const { flowCells } = copyJson;
      if (flowCells && typeof flowCells == 'object' && flowCells.hasOwnProperty('cells')) {
        FlowGraph.initGraphShape(flowCells);
        message.success({ content: '粘贴成功', key: loadingKey, duration: 2 });
        return true;
      } else {
        message.error({ content: `粘贴内容不合法，请校验`, key: loadingKey, duration: 2 });
        return false;
      }
    } catch (e) {
      message.error({ content: `粘贴内容不合法，请校验`, key: loadingKey, duration: 2 });
      return false;
    }
  };

  const onFinish = async (values: any) => {
    const success = onSubmit(values);
    if (!success) {
      return false;
    }
    onVisibleChange(false);
    return true;
  };

  return (
    <ModalForm
      title="粘贴决策流"
      visible={visible}
      onVisibleChange={(visibleValue) => {
        form.resetFields();
        onVisibleChange(visibleValue);
      }}
      form={form}
      onFinish={onFinish}
    >
      <ProFormTextArea
        name="text"
        label="决策流JSON数据"
        placeholder="请粘贴决策流内容"
        rules={[
          {
            required: true,
          },
        ]}
        fieldProps={{
          autoSize: { minRows: 4, maxRows: 8 },
        }}
      />
    </ModalForm>
  );
};

export default PasteFlow;
