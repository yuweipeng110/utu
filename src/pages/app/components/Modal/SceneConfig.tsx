import React from 'react';
import type { AppScene } from '@/models/app';
import { Modal, Typography } from 'antd';
import ProDescriptions from '@ant-design/pro-descriptions';
import type { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import _ from 'lodash';

const { Paragraph } = Typography;

type SceneConfigProps = {
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  currentData: AppScene;
};

const SceneConfig: React.FC<SceneConfigProps> = (props) => {
  const { visible, onVisibleChange, currentData } = props;

  const columns: ProDescriptionsItemProps<AppScene>[] = [
    {
      title: 'Data ID',
      dataIndex: 'diamondPrefix',
      render: (value) =>
        value ? (
          <Paragraph copyable style={{ marginBottom: '0' }}>
            {value}
          </Paragraph>
        ) : (
          '-'
        ),
    },
    {
      title: 'Data Group',
      dataIndex: 'diamondGroup',
      render: (value) =>
        value ? (
          <Paragraph copyable style={{ marginBottom: '0' }}>
            {value}
          </Paragraph>
        ) : (
          '-'
        ),
    },
  ];

  return (
    <Modal
      title={`${!_.isEmpty(currentData) ? currentData.sceneName : ''} 场景配置`}
      visible={visible}
      width="40%"
      onCancel={() => {
        onVisibleChange(false);
      }}
      footer={false}
    >
      <ProDescriptions
        column={1}
        title={false}
        bordered={true}
        dataSource={currentData}
        columns={columns}
      />
    </Modal>
  );
};

export default SceneConfig;
