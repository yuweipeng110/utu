import React, { useRef, useState } from 'react';
import { Modal, Typography } from 'antd';
import ProDescriptions from '@ant-design/pro-descriptions';
import type { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import type { PublishIndex } from '@/models/rule';
import MonacoEditor from 'react-monaco-editor';
import '../../index.less';
import { EditorCodeTheme } from "@/utils/func";

const { Paragraph } = Typography;

export type modalFormProps = {
  title: string;
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  currentData: PublishIndex;
};

const PublishIndexListModal: React.FC<modalFormProps> = (props) => {
  const { title, visible, onVisibleChange, currentData } = props;
  const editorRef = useRef();
  const [editorHeight, setEditorHeight] = useState();

  const onEditorResize = () => {
    // @ts-ignore
    const width = editorRef.current?.getLayoutInfo().width;
    // @ts-ignore
    const height = editorRef.current?.getContentHeight();
    setEditorHeight(height);

    // @ts-ignore
    // editorRef.current?.layout({ width, height });
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    onEditorResize();
  };

  const columns: ProDescriptionsItemProps<PublishIndex>[] = [
    {
      title: 'id',
      dataIndex: 'version',
    },
    {
      title: '版本',
      dataIndex: 'version',
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
      title: '数据Id',
      dataIndex: 'dataId',
      render: (value) => <Paragraph copyable>{value}</Paragraph>,
    },
    {
      title: 'md5',
      dataIndex: 'md5',
      render: (value) => <Paragraph copyable>{value}</Paragraph>,
    },
    {
      title: '内容',
      dataIndex: 'content',
      render: (value) => {
        return (
          <Paragraph style={{ width: '100%' }} copyable={{ text: value?.toString() }}>
            <MonacoEditor
              value={value?.toString()}
              width="100%"
              height={editorHeight}
              editorDidMount={handleEditorDidMount}
              theme={EditorCodeTheme}
              options={{
                readOnly: true,
                renderWhitespace: 'boundary',
                scrollbar: {
                  alwaysConsumeMouseWheel: false,
                },
                scrollBeyondLastLine: false,
              }}
              language="go"
            />
          </Paragraph>
        );
      },
    },
  ];

  return (
    <Modal
      title={title}
      visible={visible}
      width="70%"
      centered={true}
      onCancel={() => {
        onVisibleChange(false);
      }}
      footer={false}
    >
      <ProDescriptions column={2} title={false} dataSource={currentData} columns={columns} />
    </Modal>
  );
};

export default PublishIndexListModal;
