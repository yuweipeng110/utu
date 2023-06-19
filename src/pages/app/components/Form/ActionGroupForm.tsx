import React, { useEffect, useState } from 'react';
import { Button, Tooltip } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import ActionItemForm from '@/pages/app/components/Form/ActionItemForm';
import '../../index.less';

export type ActionGroupFormProps = {
  index: number;
  actionList: any;
  onActionItemChange: (value: any) => void;
  actionGroup: any;
  onRemove: (index: number) => void;
  ruleIsView: boolean;
};

const ActionGroupForm: React.FC<ActionGroupFormProps> = (props) => {
  const { index, actionList, onActionItemChange, actionGroup, onRemove, ruleIsView } = props;

  const [data, setData] = useState([]);

  useEffect(() => {
    if (actionGroup) {
      setData(actionGroup.paramList);
    }
  }, [actionGroup]);

  return (
    <ProCard
      className="action-card"
      bordered
      headerBordered
      collapsible
      // defaultCollapsed
      defaultCollapsed={false}
      size="small"
      title={<span className="left">{`[动作${index + 1}] ${actionGroup.actionName}`}</span>}
      extra={
        !ruleIsView && (
          <Tooltip title="删除当前动作">
            <Button
              type="text"
              size="small"
              onClick={(event) => {
                event?.stopPropagation();
                const newBranchStrategyList = actionList.filter(
                  (item: any) => item.index !== actionGroup.index,
                );
                onActionItemChange(newBranchStrategyList);
                onRemove(index);
              }}
            >
              <CloseOutlined />
            </Button>
          </Tooltip>
        )
      }
      style={{ padding: 0, margin: 0 }}
    >
      <ActionItemForm data={data} setData={setData} ruleIsView={ruleIsView} />
    </ProCard>
  );
};

export default ActionGroupForm;
