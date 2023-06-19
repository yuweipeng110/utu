import React from 'react';
import { Button, Modal, Result } from 'antd';
import { Link } from 'umi';
import type { InitMaster } from '@/models/app';

type InitMasterResultModalProps = {
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  currentInitMaster: InitMaster;
};

const InitMasterResultModal: React.FC<InitMasterResultModalProps> = (props) => {
  const { visible, onVisibleChange, currentInitMaster } = props;
  return (
    <Modal
      visible={visible}
      centered={true}
      onCancel={() => {
        onVisibleChange(false);
      }}
      footer={false}
    >
      <Result
        status="success"
        title="初始化master分支成功!"
        extra={[
          <Button
            key="experimentList"
            type="primary"
            onClick={() => {
              onVisibleChange(false);
            }}
          >
            <Link
              to={`/scene/experiment?app_id=${currentInitMaster?.appId}&scene_id=${currentInitMaster?.sceneId}`}
              target="_blank"
            >
              实验列表
            </Link>
          </Button>,
        ]}
      />
    </Modal>
  );
};

export default InitMasterResultModal;
