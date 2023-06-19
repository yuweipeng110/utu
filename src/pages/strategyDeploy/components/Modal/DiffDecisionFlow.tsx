import React from 'react';
import { Button, Modal } from 'antd';
import Dag from '@/pages/decisionFlow/components/AntvX6';

type DiffDecisionFlowProps = {
  title?: string;
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  currentData: any;
  //   previewLoading?: boolean;
};

export default (props: DiffDecisionFlowProps) => {
  const { title, visible, onVisibleChange, currentData } = props;

  return (
    <Modal
      title={title || 'diff'}
      visible={visible}
      onCancel={() => {
        onVisibleChange(false);
      }}
      footer={[
        <Button key="close" onClick={() => onVisibleChange(false)}>
          关闭
        </Button>,
      ]}
      width="90%"
    >
      <Dag isDisabled={true} diffDataOld={currentData.originalFlowContent} diffDataNew={currentData.flowContent} />
    </Modal>
  );
};