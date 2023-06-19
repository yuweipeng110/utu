import React, { useEffect, useRef, useState } from 'react';
import MonacoEditor from 'react-monaco-editor';
import '../index.less';

export type RuleCodeEditorProps = {
  readOnly: boolean;
  sourceCode: string;
  onValueChange?: (value: any) => void;
  codeTheme?: string;
  visualMode: boolean;
};

const RuleCodeEditor: React.FC<RuleCodeEditorProps> = (props) => {
  const { readOnly, sourceCode, onValueChange, codeTheme, visualMode } = props;
  const editorRef = useRef();
  const [editorHeight, setEditorHeight] = useState();

  useEffect(() => {
    onEditorResize();
  }, [sourceCode]);

  const onEditorResize = () => {
    try {
      // @ts-ignore
      const width = editorRef.current.getLayoutInfo()?.width;
      // @ts-ignore
      const height = editorRef.current.getContentHeight();

      // @ts-ignore
      editorRef.current.layout({ width, height });
      setEditorHeight(height);
    } catch (e) {}
  };

  const onEditorChange = (value: any, ev: any) => {
    if (onValueChange) {
      onValueChange(value);
    }
    onEditorResize();
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    onEditorResize();
  }

  return (
    <MonacoEditor
      value={sourceCode}
      width="100%"
      height={editorHeight}
      onChange={onEditorChange}
      editorDidMount={handleEditorDidMount}
      theme={codeTheme}
      options={{
        readOnly: readOnly || !visualMode,
        renderWhitespace: 'boundary',
        scrollbar: {
          alwaysConsumeMouseWheel: false,
        },
        scrollBeyondLastLine: false,
        // automaticLayout: true,
        // folding: false,
        // wordWrap: "on",
      }}
      language="go"
    />
  );
};

export default RuleCodeEditor;
