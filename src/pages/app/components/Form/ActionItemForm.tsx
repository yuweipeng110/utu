import React from 'react';
import ProTable from '@ant-design/pro-table';
import { ActionParamSource, ActionParamType, ActionParamValueBoolean } from '@/consts/action/const';
import { Input, Radio } from 'antd';

type ParamTableFormDataType = {
  index: number;
  name: string;
  type: number;
  value: string;
  source: number; //0：字面量，1：变量
};

type ActionItemFormProps = {
  data: any;
  setData: any;
  ruleIsView: boolean;
};

const ActionItemForm: React.FC<ActionItemFormProps> = (props) => {
  const { data, setData, ruleIsView } = props;

  const getRowByKey = (index: number, newData?: ParamTableFormDataType[]) =>
    (newData || data)?.filter((item: any) => item.index === index)[0];

  const handleFieldChange = (fieldName: string, value: any, index: number, option?: any) => {
    const newData = [...(data as ParamTableFormDataType[])];
    const target = getRowByKey(index, newData);
    if (target) {
      target[fieldName] = value;
      if (fieldName === 'source') {
        target['value'] = '';
        // if (target['source'] === 1) {
        //   target['value'] = '';
        // } else {
        //   target['value'] = 'true';
        // }
        if (target['type'] === 4 && target['source'] === 0) {
          target['value'] = 'true';
        }
      }
    }
    setData(newData);
  };

  const columns = [
    {
      title: '参数名称',
      dataIndex: 'name',
      editable: true,
      width: '20%',
    },
    {
      title: '参数类型',
      dataIndex: 'type',
      editable: true,
      valueEnum: ActionParamType,
      width: '20%',
    },
    {
      title: '参数值',
      dataIndex: 'value',
      editable: !ruleIsView,
      width: '30%',
      render: (text: string, record: ParamTableFormDataType) => {
        if (ruleIsView) {
          return text;
        }
        if (record.type === 4 && record.source === 0) {
          return (
            <Radio.Group
              options={Object.keys(ActionParamValueBoolean).map((key) => {
                return {
                  value: key,
                  label: ActionParamValueBoolean[key],
                };
              })}
              onChange={(e: any) => handleFieldChange('value', e.target.value, record.index)}
              // defaultValue={record.value}
              value={record.value}
            />
          );
        }
        return (
          <Input
            placeholder="请输入"
            // defaultValue={record.value}
            value={record.value}
            onChange={(e) => handleFieldChange('value', e.target.value, record.index)}
          />
        );
      },
    },
    {
      title: '参数值类型',
      dataIndex: 'source',
      editable: !ruleIsView,
      render: (text: string, record: ParamTableFormDataType) => {
        if (ruleIsView) {
          return ActionParamSource[record.source];
        }
        return (
          <Radio.Group
            options={Object.keys(ActionParamSource).map((key) => {
              return {
                value: Number(key),
                label: ActionParamSource[key],
              };
            })}
            onChange={(e: any) => handleFieldChange('source', e.target.value, record.index)}
            defaultValue={record.source || 0}
          ></Radio.Group>
        );
      },
    },
  ];

  return (
    <ProTable<ParamTableFormDataType>
      className="my-edit-pro-table"
      // @ts-ignore
      columns={columns}
      dataSource={data}
      pagination={false}
      options={false}
      search={false}
      size="small"
      width={'100%'}
      scroll={{
        y: 230,
      }}
    />
  );
};

export default ActionItemForm;
