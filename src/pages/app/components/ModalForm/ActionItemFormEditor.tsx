import React, { useState, useRef } from 'react';
import ProCard from '@ant-design/pro-card';
import { Button, Popconfirm } from "antd";
import { CloseOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import MonacoEditor from 'react-monaco-editor';
import '../../index.less';

export type itemFormEditorProps = {
  actionItem: any;
  index: number;
  itemsCount: number;
  onChange: (index: number, actionItem: string) => void;
  onMove: (sourceIndex: number, targetIndex: number) => void;
  onDelete: () => void;
  codeTheme?: string;
};

const ActionItemFormEditor: React.FC<itemFormEditorProps> = (props: any) => {
  const {
    actionItem,
    index,
    itemsCount,
    onChange,
    onMove,
    onDelete,
    codeTheme,
  } = props;
  const [editHeight, setEditorHeight] = useState<number>();
  const editorRef = useRef();

  const onEditorResize = () => {
    // @ts-ignore
    const width = editorRef.current.getLayoutInfo()?.width;
    // @ts-ignore
    const height = Math.min(1000, editorRef.current.getContentHeight());

    // @ts-ignore
    editorRef.current.layout({ width, height });
    setEditorHeight(height);
  };

  const onEditorChange = (value: any, ev: any) => {
    onEditorResize();
    onChange(index, { exec: value });
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    onEditorResize();
  }

  return (
    <ProCard
      bordered
      title={`[动作${index + 1}] ${actionItem?.name}`}
      headerBordered={false}
      collapsible
      defaultCollapsed
      size="small"
      key={index}
      extra={
        [
          <Button
            disabled={index === 0}
            onClick={(event) => {
              event.stopPropagation()
              onMove(index, index - 1);
            }}
            key="0"
          >
            <ArrowUpOutlined />
          </Button>,
          <Button
            onClick={(event) => {
              event.stopPropagation()
              onMove(index, index + 1);
            }}
            key="1"
            disabled={itemsCount === index + 1}
          >
            <ArrowDownOutlined />
          </Button>,
          <Popconfirm
            title="确定要删除吗？"
            key="2"
            onConfirm={async () => {
              await onDelete(index);
            }}
          >
            <Button>
              <CloseOutlined />
            </Button>
          </Popconfirm>,
        ]
      }
    >
      <MonacoEditor
        key={index}
        value={actionItem?.actionContent}
        width="100%"
        height={editHeight}
        language="toml"
        onChange={onEditorChange}
        editorDidMount={handleEditorDidMount}
        theme={codeTheme}
        options={{
          readOnly: true,
          renderWhitespace: 'boundary',
          scrollBeyondLastLine: false,
          minimap: {
            enabled: false,
          },
          scrollbar: {
            alwaysConsumeMouseWheel: false,
          },
        }}
      />
    </ProCard>
  );
};

export default ActionItemFormEditor;
