import React, { useRef, useState } from 'react';
import { Button, Modal } from 'antd';
import { StrategyInfo } from '@/models/strategy';
import MonacoEditor from 'react-monaco-editor';
import { EditorCodeTheme } from '@/utils/func';

type ViewStrategyCodeProps = {
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  currentStrategyData: StrategyInfo;
};

const ViewStrategyCode: React.FC<ViewStrategyCodeProps> = (props) => {
  const { visible, onVisibleChange, currentStrategyData } = props;
  const editorRef = useRef();

  const [editorHeight, setEditorHeight] = useState<number>(0);

  const onEditorResize = () => {
    // @ts-ignore
    const width = editorRef.current.getLayoutInfo()?.width;
    // @ts-ignore
    const height: number = 600;

    // @ts-ignore
    editorRef.current.layout({ width, height });
    setEditorHeight(height);
  };

  const onEditorChange = (value: any, ev: any) => {
    onEditorResize();
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    onEditorResize();
  };

  return (
    <Modal
      title="预览"
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
      <MonacoEditor
        value={currentStrategyData.strategyDetail}
        width="100%"
        height={editorHeight}
        onChange={onEditorChange}
        editorDidMount={handleEditorDidMount}
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
    </Modal>
  );
};

export default ViewStrategyCode;
