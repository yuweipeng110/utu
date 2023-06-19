import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CloseOutlined,
  RightOutlined,
} from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import { Popconfirm, Button } from 'antd';
import MonacoEditor from 'react-monaco-editor';
import '../../index.less';

export type itemFormEditorProps = {
  readOnly: boolean;
  ruleItem: any;
  index: number;
  itemsCount: number;
  onDelete: () => void;
  onChange: (index: number, ruleItem: string) => void;
  onMove: (sourceIndex: number, targetIndex: number) => void;
  onCardCollapsed: (index: number, collapsed: boolean) => void;
  codeTheme?: string;
  visualMode: boolean;
};

const defaultExec = '\n\n\n\n\n';

const RuleItemFormEditor: React.FC<itemFormEditorProps> = (props: any) => {
  const {
    readOnly,
    ruleItem,
    index,
    itemsCount,
    onDelete,
    onChange,
    onMove,
    onCardCollapsed,
    codeTheme,
    visualMode,
  } = props;
  const [editHeight, setEditorHeight] = useState<number>();
  const editorRef = useRef();

  useEffect(() => {
    onEditorResize();
  }, [ruleItem]);

  const onEditorResize = () => {
    try {
      // @ts-ignore
      const width = editorRef.current.getLayoutInfo()?.width;
      // @ts-ignore
      const height = editorRef.current.getContentHeight();
      // const height = Math.min(1000, editorRef.current.getContentHeight());
      // const height = editorRef.current.getContentHeight() <= 100 ? 100 : editorRef.current.getContentHeight()

      // @ts-ignore
      editorRef.current.layout({ width, height });
      setEditorHeight(height);
    } catch (e) {}
  };

  const onEditorChange = (value: any, ev: any) => {
    onEditorResize();
    onChange(index, { exec: value });
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    onEditorResize();
  };

  return (
    <ProCard
      bordered
      title={
        <div
          style={{ cursor: 'pointer' }}
          onClick={() => {
            onCardCollapsed(index, !ruleItem?.collapsed);
          }}
        >
          <RightOutlined rotate={!ruleItem?.collapsed ? 90 : undefined} />{' '}
          {`[规则${index + 1}] ${ruleItem?.name} - ${ruleItem?.desc}`}
        </div>
      }
      // headerBordered={false}
      // collapsible
      // defaultCollapsed={false}
      headerBordered
      collapsed={ruleItem?.collapsed ?? false}
      size="small"
      key={index}
      extra={
        readOnly || !visualMode
          ? null
          : [
              <Button
                disabled={index === 0}
                onClick={() => {
                  onMove(index, index - 1);
                }}
                key="0"
              >
                <ArrowUpOutlined />
              </Button>,
              <Button
                onClick={() => {
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
                onConfirm={() => {
                  onDelete(index);
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
        value={ruleItem?.exec ?? defaultExec}
        width="100%"
        height={editHeight}
        language="go"
        onChange={onEditorChange}
        editorDidMount={handleEditorDidMount}
        theme={codeTheme}
        options={{
          readOnly: readOnly || !visualMode,
          renderWhitespace: 'boundary',
          scrollbar: {
            alwaysConsumeMouseWheel: false,
          },
          minimap: {
            enabled: false,
          },
          scrollBeyondLastLine: false,
          // automaticLayout: true,
          // folding: false,
          // wordWrap: "on",
        }}
      />
    </ProCard>
  );
};

export default RuleItemFormEditor;
