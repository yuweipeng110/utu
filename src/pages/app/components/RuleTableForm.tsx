import React from 'react';
import { Link } from 'umi';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Empty, Alert, Spin, Form, Radio, Select } from 'antd';
import ProForm, { ProFormSelect, ProFormText } from '@ant-design/pro-form';
import ProTable from '@ant-design/pro-table';
import {
  RuleNullValueHandle,
  RuleOptionStringOperator,
  RuleOptionNumberOperator,
  RuleOptionFloatOperator,
  RuleOptionBoolOperator,
  RuleOptionObjectOperator,
} from '@/consts/rule/const';
import _ from 'lodash';
import '../index.less';

const { Option } = Select;

interface TableFormDataType {
  id: string;
  leftOptions?: any;
  leftPropertiesOption?: any;
  rightOptions?: any;
  rightPropertiesOption?: any;
  index: number;
  placeholder: string;
  leftVal: string | undefined;
  leftType: number;
  leftDesc: string;
  leftExpression?: string;
  leftResultType?: number;
  leftDependenceList?: [];
  leftValType?: number;
  leftValDesc?: string;
  leftProperties?: any;
  option: string | undefined;
  optionType?: number;
  nullValueHandle: string | null;
  rightVal: string | undefined;
  rightType?: number;
  rightDesc?: string;
  rightValType?: number;
  rightValDesc?: string;
  rightProperties?: any;
  source: number;
}

interface RuleTableFormProps {
  ruleTableLoading: boolean;
  form: any;
  options: any;
  isView: any;
  isShowSenior: boolean;
  data: TableFormDataType[];
  setData: (data: any) => void;
  handleSearchLeftVal: any;
  searchLeftValCancel: any;
  searchLeftValLoading: any;
}

const RuleTableForm: React.FC<RuleTableFormProps> = (props) => {
  const {
    ruleTableLoading,
    form,
    options,
    isView,
    isShowSenior,
    data,
    setData,
    handleSearchLeftVal,
    searchLeftValCancel,
    searchLeftValLoading,
  } = props;

  const getRowByKey = (index: number, newData?: TableFormDataType[]) =>
    (newData || data)?.filter((item) => item.index === index)[0];

  /**
   * 新增一行规则集
   */
  const newRuleSet = () => {
    const newData = data?.map((item) => ({ ...item })) || [];

    newData.push({
      id: (Math.random() * 1000000).toFixed(0),
      index: !_.isEmpty(data) ? data.length : 0,
      placeholder: '$' + (!_.isEmpty(data) ? data.length + 1 : 1),
      leftVal: undefined,
      leftType: 0,
      leftDesc: '',
      leftValType: 0,
      leftValDesc: '',
      leftProperties: [],
      leftOptions: options,
      leftPropertiesOption: [],
      option: undefined,
      nullValueHandle: '-1',
      rightVal: '',
      rightType: 0,
      rightDesc: '',
      rightValType: 0,
      rightValDesc: '',
      rightProperties: [],
      rightOptions: options,
      rightPropertiesOption: [],
      source: 0,
    });

    form.setFieldsValue({ [`item_leftVal_${newData[newData.length - 1].id}`]: undefined });
    form.setFieldsValue({ [`item_option_${newData[newData.length - 1].id}`]: undefined });
    form.setFieldsValue({ [`item_rightVal_${newData[newData.length - 1].id}`]: undefined });
    form.setFieldsValue({
      [`item_nullValueHandle_${newData[newData.length - 1].id}`]: undefined,
    });

    // 滚动条到最后
    setTimeout(() => {
      try {
        const myDiv = document.querySelector('.my-edit-pro-table .ant-table-body');
        let scrollH;
        // @ts-ignore
        scrollH = myDiv.scrollHeight;
        // @ts-ignore
        myDiv.scrollTop = scrollH;
      } catch {}
    }, 0);

    setData(newData);
  };

  /**
   * 删除
   *
   * @param index
   *    索引
   */
  const remove = async (id: string) => {
    const newData = data
      ?.filter((item) => item.id !== id)
      .map((item, index) => {
        return {
          ...item,
          index,
          id: (Math.random() * 1000000).toFixed(0),
          placeholder: `\$${index + 1}`,
        };
      }) as TableFormDataType[];
    setData(newData);
  };

  /**
   * 获取当前操作服
   *
   * @param leftType
   *    左边量类型
   */
  const getCurrentOperator = (leftType: number) => {
    let tmpOperator: { label: string; value: string }[];
    switch (leftType) {
      case 1:
        tmpOperator = RuleOptionStringOperator;
        break;
      case 2:
        tmpOperator = RuleOptionNumberOperator;
        break;
      case 3:
        tmpOperator = RuleOptionFloatOperator;
        break;
      case 4:
        tmpOperator = RuleOptionBoolOperator;
        break;
      case 5:
        tmpOperator = RuleOptionObjectOperator;
        break;
      default:
        tmpOperator = [];
        break;
    }
    return tmpOperator;
  };

  /**
   * 改变行leftVal处理逻辑
   * @param target
   * @param index
   * @param option
   */
  const handleRowChangeLeftVal = (target: any, id: any, option: any) => {
    form.setFieldsValue({ [`item_leftValTwo_${id}`]: undefined });
    form.setFieldsValue({ [`item_option_${id}`]: undefined });
    form.setFieldsValue({ [`item_rightVal_${id}`]: '' });
    form.setFieldsValue({ [`item_rightValTwo_${id}`]: undefined });
    form.setFieldsValue({ [`item_nullValueHandle_${id}`]: '-1' });
    target['leftValDesc'] = '';
    target['leftValType'] = 0;
    target['option'] = undefined;
    target['optionType'] = 1;
    target['rightVal'] = '';
    target['rightType'] = 0;
    target['rightDesc'] = '';
    target['nullValueHandle'] = '-1';
    target['leftPropertiesOption'] = [];
    target['leftValTwo'] = '';
    target['leftValType'] = 0;
    target['rightPropertiesOption'] = [];
    target['rightValTwo'] = '';
    target['rightValType'] = 0;
    target['rightValDesc'] = '';
    target['source'] = 0;

    if (option) {
      target['leftType'] = option.featureType;
      target['leftDesc'] = option.featureDesc;
      target['leftExpression'] = option.expression;
      target['leftResultType'] = option.resultType;
      target['leftDependenceList'] = option.dependenceList;
    }
    // 类型为Object逻辑
    if (option && option.featureType === 5) {
      target['leftPropertiesOption'] = option.featureProperties;
      target['leftProperties'] = option.featureProperties;
    }
  };

  /**
   * 控制字段改变
   *
   * @param fieldName
   *    字段名称
   * @param value
   *    改变的值
   * @param index
   *    索引
   */
  const handleFieldChange = (fieldName: string, value: any, record: any, option?: any) => {
    const { index, id } = record;
    const newData = [...(data as TableFormDataType[])];
    const target = getRowByKey(index, newData);
    if (target) {
      target[fieldName] = value;
      if (fieldName === 'leftVal') {
        handleRowChangeLeftVal(target, id, option);
      }
      if (fieldName === 'leftValTwo') {
        target['leftVal'] = `${form.getFieldValue([`item_leftVal_${id}`])}.${form.getFieldValue([
          `item_leftValTwo_${id}`,
        ])}`;
        target['leftValType'] = 0;
        target['leftValDesc'] = '';
        form.setFieldsValue({ [`item_rightVal_${id}`]: undefined });
        form.setFieldsValue({ [`item_rightValTwo_${id}`]: undefined });
        form.setFieldsValue({ [`item_option_${id}`]: undefined });
        target['option'] = undefined;
        target['optionType'] = 1;
        target['rightVal'] = '';
        target['rightValTwo'] = '';
        if (option) {
          target['leftValType'] = option.type;
          target['leftValDesc'] = option.desc;
        } else {
          target['leftVal'] = form.getFieldValue([`item_leftVal_${id}`]);
          target['optionType'] = 0;
        }
      }
      if (fieldName === 'option') {
        target['rightVal'] = '';
        target['rightType'] = 0;
        target['rightDesc'] = '';
        target['rightValType'] = 0;
        target['rightValDesc'] = '';
        form.setFieldsValue({ [`item_rightVal_${id}`]: '' });
        if (option) {
          target['source'] = option.source;
          target['optionType'] = option.option_type;
          if (option.value.indexOf('#') >= 0) {
            target['rightVal'] = '';
            target['rightValTwo'] = '';
            form.setFieldsValue({ [`item_rightVal_${id}`]: undefined });
            form.setFieldsValue({ [`item_rightValTwo_${id}`]: undefined });
            // target['option'] = option.value.replace('#', '');
          }
        }
      }
      if (fieldName === 'rightVal') {
        target['rightType'] = 0;
        target['rightPropertiesOption'] = [];
        if (option) {
          target['rightType'] = option.featureType;
          target['rightDesc'] = option.featureDesc;
        }
        // 类型为Object逻辑
        if (option && option.featureType === 5) {
          form.setFieldsValue({ [`item_rightValTwo_${id}`]: undefined });
          target['rightPropertiesOption'] = [];
          target['rightValType'] = 0;
          target['rightValTwo'] = '';
          target['rightProperties'] = option.featureProperties;
          if (target['leftType'] !== 5) {
            target['rightPropertiesOption'] = option.featureProperties.filter(
              (item: any) =>
                item.type === target['leftType'] || item.type === target['leftResultType'],
            );
          } else {
            target['rightPropertiesOption'] = option.featureProperties.filter(
              (item: any) => item.type === target['leftValType'],
            );
          }
        }
      }
      if (fieldName === 'rightValTwo') {
        target['rightVal'] = `${form.getFieldValue([`item_rightVal_${id}`])}.${form.getFieldValue([
          `item_rightValTwo_${id}`,
        ])}`;
        if (option) {
          target['rightValType'] = option.type;
          target['rightValDesc'] = option.desc;
        }
      }
      setData(newData);
    }
  };

  const columns = [
    {
      title: '占位符',
      dataIndex: 'placeholder',
      align: 'center',
      width: '7%',
      editable: false,
      copyable: true,
    },
    {
      title: '左变量',
      dataIndex: 'leftVal',
      // align: 'center',
      width: '25%',
      editable: !isView,
      render: (text: string, record: TableFormDataType) => {
        // // 兼容数据为函数/聚合类型 旧版本查看
        // if (record.leftType > 5 && !record.leftResultType) {
        //   return record.leftDesc;
        // }
        // 左边量options
        let currentLeftOptions: any = [];
        data.map((item: any) => {
          if (record.index === item.index) {
            currentLeftOptions = item.leftOptions;
            return;
          }
        });
        // 查看
        if (isView) {
          let viewTitle: any;
          if (record.leftType !== 5) {
            currentLeftOptions.map((item: any) => {
              if (record.leftVal === item.value) {
                viewTitle = item.label;
                return;
              }
            });
            return viewTitle;
          }
          currentLeftOptions.map((item: any) => {
            if (record.leftVal?.split('.')[0] === item.value) {
              viewTitle = item.label;
              return;
            }
          });
          record.leftPropertiesOption.map((item: any) => {
            if (record.leftVal?.split('.')[1] === item.value) {
              viewTitle += `-${item.label}`;
              return;
            }
          });
          return viewTitle;
        }
        // 添加/修改
        if (record.leftType !== 5) {
          return (
            <ProFormSelect
              name={`item_leftVal_${record.id}`}
              label={false}
              showSearch
              options={currentLeftOptions}
              fieldProps={{
                optionLabelProp: 'option_label',
                placeholder: '请输入特征名称或描述',
                showArrow: true,
                filterOption: false,
                onChange: (value: any, option: any) =>
                  handleFieldChange('leftVal', value, record, option),
                onSearch: (value) => handleSearchLeftVal(value, record.index, 'leftSearch'),
                onBlur: searchLeftValCancel,
                onClear: () => handleSearchLeftVal('', record.index, 'leftSearch'),
                loading: searchLeftValLoading,
                notFoundContent: searchLeftValLoading ? <Spin size="small" /> : <Empty />,
                getPopupContainer: () => document.getElementById('my-condition-card'),
              }}
              initialValue={record.leftVal}
            />
          );
        }
        return (
          <ProForm.Group>
            <ProFormSelect
              name={`item_leftVal_${record.id}`}
              label={false}
              showSearch
              options={currentLeftOptions}
              fieldProps={{
                optionLabelProp: 'option_label',
                placeholder: '请输入特征名称或描述',
                showArrow: true,
                filterOption: false,
                onChange: (value: any, option: any) =>
                  handleFieldChange('leftVal', value, record, option),
                onSearch: (value) => handleSearchLeftVal(value, record.index, 'leftSearch'),
                onBlur: searchLeftValCancel,
                onClear: () => handleSearchLeftVal('', record.index, 'leftSearch'),
                loading: searchLeftValLoading,
                notFoundContent: searchLeftValLoading ? <Spin size="small" /> : <Empty />,
                getPopupContainer: () => document.getElementById('my-condition-card'),
              }}
              initialValue={record.leftVal?.split('.')[0] || undefined}
              width="lg"
            />
            <ProFormSelect
              name={`item_leftValTwo_${record.id}`}
              label={false}
              showSearch
              options={record.leftPropertiesOption}
              fieldProps={{
                optionLabelProp: 'option_label',
                placeholder: '请选择特征属性',
                showArrow: true,
                filterOption: false,
                onChange: (value: any, option: any) =>
                  handleFieldChange('leftValTwo', value, record, option),
                  getPopupContainer: () => document.getElementById('my-condition-card'),
              }}
              initialValue={record.leftVal?.split('.')[1] || undefined}
              width="lg"
            />
          </ProForm.Group>
        );
      },
    },
    {
      title: '操作符',
      dataIndex: 'option',
      // align: 'center',
      width: '14%',
      editable: !isView,
      render: (text: string, record: TableFormDataType) => {
        // // 兼容数据为函数/聚合类型 旧版本查看
        // if (record.leftType > 5 && !record.leftResultType) {
        //   return <div style={{ color: 'red' }}>未找到操作符</div>;
        // }
        // const operator = !record.leftValType
        //   ? getCurrentOperator(record.leftType)
        //   : getCurrentOperator(record.leftValType!);
        let operator: any = [];
        if (record.leftType) {
          operator = getCurrentOperator(record.leftType);
        }
        if (record.leftValType) {
          operator = getCurrentOperator(record.leftValType);
        }
        if (record.leftResultType) {
          operator = getCurrentOperator(record.leftResultType);
        }
        if (isView) {
          let optionTitle;
          operator.map((item: any) => {
            if (record.option === item.value) {
              optionTitle = item.label;
              return;
            }
          });
          return optionTitle;
        }
        return (
          <>
            <ProFormSelect
              placeholder="请选择"
              name={`item_option_${record.id}`}
              label={false}
              options={operator}
              fieldProps={{
                onChange: (value, option) => handleFieldChange('option', value, record, option),
                getPopupContainer: () => document.getElementById('my-condition-card'),
                // virtual: false,
              }}
              initialValue={record.option}
              style={{ width: '100%' }}
            />
          </>
        );
      },
    },
    {
      title: '右变量',
      dataIndex: 'rightVal',
      // align: 'center',
      tooltip: '当前右变量只支持字面量，暂时不支持变量和特征',
      width: '25%',
      editable: !isView,
      render: (text: string, record: TableFormDataType) => {
        // // 兼容数据为函数/聚合类型 旧版本查看
        // if (record.leftType > 5 && !record.leftResultType) {
        //   return record.rightVal;
        // }
        // 通过optionType控制显示内容 1： 不显示任何内容、2：显示input输入框、3：显示特征下拉select列表选项
        // 不显示任何输入内容
        if (Number(record.optionType) === 1) {
          return null;
        }
        // 显示input输入框
        if (record.optionType === 2) {
          return isView ? (
            text
          ) : (
            <ProFormText
              name={`item_rightVal_${record.id}`}
              label={false}
              placeholder={record.option === 'InArray' ? '英文逗号分隔，如：aaa,bbb,ccc' : '请输入'}
              fieldProps={{
                onChange: (e) => handleFieldChange('rightVal', e.target.value, record),
              }}
              initialValue={record.rightVal}
              style={{ width: '100%' }}
            />
          );
        }
        // 右变量options
        let currentRightOptions: any = [];
        data.map((item: any) => {
          if (record.index === item.index) {
            currentRightOptions = item.rightOptions;
            return;
          }
        });

        if (_.isNumber(record.leftResultType)) {
          currentRightOptions = currentRightOptions.filter(
            (item: any) => item.featureType === record.leftResultType || item.featureType === 5,
          );
        } else {
          currentRightOptions = currentRightOptions.filter(
            (item: any) =>
              item.featureType === record.leftType ||
              item.featureType === record.leftValType ||
              item.featureType === 5,
          );
        }

        // 查看
        if (isView) {
          let viewTitle: any;
          if (record.rightType !== 5 || record.rightType === null) {
            currentRightOptions.map((item: any) => {
              if (record.rightVal === item.value) {
                viewTitle = item.label;
                return;
              }
            });
            return viewTitle;
          }
          currentRightOptions.map((item: any) => {
            if (record.rightVal?.split('.')[0] === item.value) {
              viewTitle = item.label;
              return;
            }
          });
          record.rightPropertiesOption.map((item: any) => {
            if (record.rightVal?.split('.')[1] === item.value) {
              viewTitle += `-${item.label}`;
              return;
            }
          });
          return viewTitle;
        }
        // 添加/修改
        if (record.rightType !== 5) {
          return (
            <ProFormSelect
              name={`item_rightVal_${record.id}`}
              label={false}
              showSearch
              options={currentRightOptions}
              fieldProps={{
                optionLabelProp: 'option_label',
                placeholder: '请输入特征名称或描述',
                showArrow: true,
                filterOption: false,
                onChange: (value: any, option: any) =>
                  handleFieldChange('rightVal', value, record, option),
                onSearch: (value) =>
                  handleSearchLeftVal(value, record.index, 'rightSearch', record.leftType),
                onBlur: searchLeftValCancel,
                onClear: () => handleSearchLeftVal('', record.index, 'rightSearch'),
                loading: searchLeftValLoading,
                notFoundContent: searchLeftValLoading ? <Spin size="small" /> : <Empty />,
                getPopupContainer: () => document.getElementById('my-condition-card'),
              }}
              initialValue={record.rightVal || undefined}
              style={{ width: '100%' }}
            />
          );
        }

        return (
          <ProForm.Group>
            <ProFormSelect
              name={`item_rightVal_${record.id}`}
              label={false}
              showSearch
              options={currentRightOptions}
              fieldProps={{
                optionLabelProp: 'option_label',
                placeholder: '请输入特征名称或描述',
                showArrow: true,
                filterOption: false,
                onChange: (value: any, option: any) =>
                  handleFieldChange('rightVal', value, record, option),
                onSearch: (value) =>
                  handleSearchLeftVal(value, record.index, 'rightSearch', record.leftType),
                onBlur: searchLeftValCancel,
                onClear: () => handleSearchLeftVal('', record.index, 'rightSearch'),
                loading: searchLeftValLoading,
                notFoundContent: searchLeftValLoading ? <Spin size="small" /> : <Empty />,
                getPopupContainer: () => document.getElementById('my-condition-card'),
              }}
              initialValue={record.rightVal?.split('.')[0] || undefined}
              width="lg"
            />
            <ProFormSelect
              name={`item_rightValTwo_${record.id}`}
              label={false}
              showSearch
              options={record.rightPropertiesOption}
              fieldProps={{
                optionLabelProp: 'option_label',
                placeholder: '请选择特征属性',
                showArrow: true,
                filterOption: false,
                onChange: (value: any, option: any) =>
                  handleFieldChange('rightValTwo', value, record, option),
                  getPopupContainer: () => document.getElementById('my-condition-card'),
              }}
              initialValue={record.rightVal?.split('.')[1] || undefined}
              width="lg"
            />
          </ProForm.Group>
        );
      },
    },
    isShowSenior && {
      title: '变量为空时',
      dataIndex: 'nullValueHandle',
      align: 'center',
      width: '8%',
      editable: !isView,
      // hideInTable: !isShowSenior,
      render: (text: string, record: TableFormDataType) => {
        const formatNullValueHandle = record.nullValueHandle || '-1';
        if (isView) {
          return RuleNullValueHandle[formatNullValueHandle];
        }
        return (
          <Form.Item name={`item_nullValueHandle_${record.id}`}>
            <Select
              size="small"
              onChange={(value) => {
                handleFieldChange('nullValueHandle', value, record);
              }}
              defaultValue={formatNullValueHandle}
            >
              {Object.keys(RuleNullValueHandle).map((key) => {
                return <Option value={key.toString()}>{RuleNullValueHandle[key]}</Option>;
              })}
            </Select>
          </Form.Item>
          // 该组件添加一条直接选会引起data数据错误问题
          // <ProFormRadio.Group
          //   name={`item_nullValueHandle_${record.id}`}
          //   label={false}
          //   options={Object.keys(RuleNullValueHandle).map((key) => {
          //     return {
          //       value: key.toString(),
          //       label: RuleNullValueHandle[key],
          //     };
          //   })}
          //   fieldProps={{
          //     onChange: (e) => handleFieldChange('nullValueHandle', e.target.value, record),
          //   }}
          //   initialValue={formatNullValueHandle}
          // />
        );
      },
    },
    {
      title: '操作',
      align: 'center',
      valueType: 'option',
      width: '5%',
      editable: !isView,
      render: (text: string, record: TableFormDataType) => {
        const deleteBtn = <a onClick={() => remove(record.id)}>删除</a>;
        return isView ? null : deleteBtn;
      },
    },
  ];

  return (
    <Spin spinning={ruleTableLoading}>
      {!_.isEmpty(options) ? (
        <>
          <ProTable<TableFormDataType>
            className="my-edit-pro-table"
            rowKey="id"
            // @ts-ignore
            columns={columns}
            dataSource={data}
            pagination={false}
            options={false}
            search={false}
            size="small"
            width={'100%'}
            scroll={{
              y: 495,
            }}
          />
          {!isView && (
            <Button
              style={{ width: '100%', marginTop: 16, marginBottom: 8 }}
              type="dashed"
              onClick={newRuleSet}
            >
              <PlusOutlined />
              添加子条件
            </Button>
          )}
        </>
      ) : (
        <Alert
          message={
            <>
              当前应用下没有特征，请先添加特征后操作规则集条件{' '}
              <Link to="/knowledge/shop/feature">进入特征管理</Link>
            </>
          }
          type="warning"
          showIcon
        />
      )}
    </Spin>
  );
};

export default RuleTableForm;
