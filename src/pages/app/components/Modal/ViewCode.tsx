import React from 'react';
import { Button, Modal, Spin } from 'antd';
import MonacoEditor from 'react-monaco-editor';
import { EditorCodeTheme } from '@/utils/func';

type ViewCodeProps = {
  title?: string;
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  sourceCode: string;
  previewLoading: boolean;
};

const ViewCode: React.FC<ViewCodeProps> = (props) => {
  const { title, visible, onVisibleChange, sourceCode, previewLoading } = props;

  return (
    <Modal
      title={title || '预览'}
      visible={visible}
      onCancel={() => {
        onVisibleChange(false);
      }}
      footer={[
        <Button key="close" onClick={() => onVisibleChange(false)}>
          关闭
        </Button>,
      ]}
      width="70%"
    >
      <Spin spinning={previewLoading}>
        <MonacoEditor
          value={sourceCode}
          width="100%"
          height={600}
          theme={EditorCodeTheme}
          options={{
            readOnly: true,
            renderWhitespace: 'boundary',
            scrollbar: {
              alwaysConsumeMouseWheel: false,
            },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
          }}
          language="go"
        />
      </Spin>
    </Modal>
  );
};

export default ViewCode;
