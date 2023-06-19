import React, { useEffect, useRef, useState } from 'react';
import { message, Modal, Spin } from 'antd';
import { PublishDetail } from '@/models/publish';
import { publishOrderDiffWith } from '@/services/publish';
import { MonacoDiffEditor } from 'react-monaco-editor';
import { EditorCodeTheme } from '@/utils/func';
import { getPageQuery } from '@/utils/utils';
import '../../index.less';

type RuleDiffModalProps = {
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  currentData: PublishDetail;
};

const RuleDiffModal: React.FC<RuleDiffModalProps> = (props) => {
  const { visible, onVisibleChange, currentData } = props;
  const diffEditorRef = useRef();
  const queryParams = getPageQuery();
  const publishOrderId = queryParams.publish_order_id;

  const [currentContent, setCurrentContent] = useState<string>('');
  const [onlineContent, setOnlineContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const onEditorResize = () => {
    try {
      // @ts-ignore
      const oldWidth = diffEditorRef.current.getOriginalEditor().getLayoutInfo()?.width;
      // @ts-ignore
      const oldHeight = diffEditorRef.current.getOriginalEditor().getContentHeight();
      // @ts-ignore
      const newWidth = diffEditorRef.current.getModifiedEditor().getLayoutInfo()?.width;
      // @ts-ignore
      const newHeight = diffEditorRef.current.getModifiedEditor().getContentHeight();
      const height = Math.max(oldHeight, newHeight);

      // @ts-ignore
      // diffEditorRef.current.getOriginalEditor().layout({ oldWidth, oldHeight });
      // @ts-ignore
      // diffEditorRef.current.getModifiedEditor().layout({ newWidth, newHeight });
      // setDiffEditorHeight(600);
      // setDiffEditorHeight(height);
    } catch (e) {}
  };

  function handleDiffEditorDidMount(diffEditor: any) {
    diffEditorRef.current = diffEditor;
    onEditorResize();
  }

  const loadDiffRequest = async () => {
    setLoading(true);
    const res = await publishOrderDiffWith({
      publishOrderId: Number(publishOrderId),
      currentBranchId: currentData.branchId,
      action: currentData.action,
    });
    setLoading(false);
    if (res.code !== 1) {
      message.error(res.message);
      return false;
    }
    setCurrentContent(res.data.currentContent ?? '');
    setOnlineContent(res.data.onlineContent ?? '');
    return true;
  };

  useEffect(() => {
    if (visible) {
      loadDiffRequest();
    }
  }, [visible]);

  return (
    <Modal
      title="对比"
      visible={visible}
      width="90%"
      centered={true}
      onCancel={() => {
        onVisibleChange(false);
        setCurrentContent('');
        setOnlineContent('');
      }}
      cancelText="关闭"
      okButtonProps={{
        style: {
          display: 'none',
        },
      }}
    >
      <Spin spinning={loading}>
        <div>
          <div style={{ padding: 10, display: 'flex', justifyContent: 'space-around' }}>
            <div>
              当前内容 {currentData.action === 2 && <span style={{ color: 'red' }}>(待删除)</span>}
            </div>
            <div>线上内容</div>
          </div>
          <MonacoDiffEditor
            original={currentContent || ''}
            value={onlineContent || ''}
            width="100%"
            height={600}
            editorDidMount={handleDiffEditorDidMount}
            theme={EditorCodeTheme}
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
      </Spin>
    </Modal>
  );
};

export default RuleDiffModal;
