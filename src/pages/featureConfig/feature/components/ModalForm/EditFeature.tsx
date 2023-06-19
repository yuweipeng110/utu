import React, { useEffect, useRef, useState } from 'react';
import { useRequest, connect } from 'umi';
import type { ConnectProps, Dispatch } from 'umi';
import type { ConnectState } from '@/models/connect';
import ProForm, { ModalForm, ProFormRadio, ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { ActionType, EditableProTable, ProColumns } from '@ant-design/pro-table';
import { Form, Spin, Button, message, Space, Typography, Popconfirm } from 'antd';
import { InfoCircleTwoTone } from '@ant-design/icons';
import type { FeatureInfo, FeatureProperties } from '@/models/featureConfig';
import { addFeature, editFeature } from '@/services/featureConfig';
import { searchFeature } from '@/services/strategy';
import InputTag from '@/pages/featureConfig/feature/components/InputTag';
import type { AppInfo } from '@/models/app';
import {
  FeatureDataType,
  FeatureSource,
  FeaturePropertiesType,
  FeatureDefaultValue,
  FeatureReadOnly,
  FeatureValueType,
} from '@/consts/feature/const';
import _ from 'lodash';

const { Paragraph } = Typography;

export type EditFeatureProps = {
  actionRef: any;
  title: string;
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  currentData: FeatureInfo;
  isView: boolean;
  isCopy: boolean;
  setIsCopy: (isCopy: boolean) => void;
  dispatch?: Dispatch;
  currentApp?: AppInfo;
} & Partial<ConnectProps>;

const EditFeature: React.FC<EditFeatureProps> = (props) => {
  const {
    actionRef,
    title,
    visible,
    onVisibleChange,
    isView,
    isCopy,
    setIsCopy,
    currentData,
    currentApp,
  } = props;
  // const initialValues = { ...currentData };
  const initialValues = !_.isEmpty(currentData)
    ? {
        ...currentData,
        ...currentData.expressionStruct,
        dependenceList:
          _.isEmpty(currentData.expressionStruct) ||
          _.isEmpty(currentData.expressionStruct.dependenceList)
            ? []
            : currentData.expressionStruct.dependenceList,
      }
    : { source: 1, readOnly: 0, featureValueType: 0 };
  const [form] = Form.useForm();
  const editableActionRef = useRef<ActionType>();
  const inputTagRef = useRef();

  const [featurePropertiesList, setFeaturePropertiesList] = useState<Partial<FeatureProperties>[]>(
    [],
  );
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [featurePropertiesListError, setFeaturePropertiesListError] = useState<string>('');
  const [featureType, setFeatureType] = useState<number>(0);
  const [featureValueType, setFeatureValueType] = useState(0);
  const [featureTagsList, setFeatureTagsList] = useState([]);
  // tag标签回车事件
  const [isClickSubmit, setIsClickSubmit] = useState<boolean>(false);
  // 依赖特征
  const [dependenceOptions, setDependenceOptions] = useState([]);
  const [dependenceInputValue, setDependenceInputValue] = useState<string>('');
  const [dependenceSelectedList, setDependenceSelectedList] = useState([]);
  const expressionTooltip =
    featureType === 10
      ? '支持自定义函数，如：getBucketId(uid,layerId,index)'
      : '支持加减乘除()组成的简单表达式，如：(a + b) * 2';

  const featureValuePattern = (type: number) => {
    let patternObj = {};
    switch (type) {
      case 2:
        patternObj = {
          pattern: /^([0-9]*|-[0-9]*)$/,
          message: '仅支持数字',
        };
        break;
      case 3:
        patternObj = {
          pattern: /^[-]?[0-9]*\.?[0-9]+$/,
          message: '仅支持数字、小数点',
        };
        break;
      case 4:
        patternObj = {
          pattern: /^(true)|(false)$/,
          message: '仅支持true、false',
        };
        break;
      case 10:
        patternObj = {
          pattern: /^[a-zA-Z0-9_]+\(([^()]*)\)/,
          message: '格式错误，请输入自定义函数',
        };
        break;
      case 11:
        patternObj = {
          pattern: /^[a-zA-Z0-9_()][a-zA-Z0-9_.()\s\+\-\*\/\%]*$/,
          message: '格式错误，请输入简单表达式',
        };
        break;
      default:
    }
    return patternObj;
  };

  /**
   * 验证属性列表
   */
  const validateProertiesList = () => {
    if (featureType === 5 && (!featurePropertiesList || !featurePropertiesList.length)) {
      return {
        code: -1,
        message: '属性列表不能为空',
      };
    }
    let hashName = {};
    for (let idx = 0; idx < featurePropertiesList.length; idx += 1) {
      const proerties: any = { ...featurePropertiesList[idx] };

      if (!proerties.name || !proerties.name.length) {
        return {
          code: -1,
          message: `属性名称不能为空`,
        };
      }
      if (!proerties.type) {
        return {
          code: -1,
          message: `属性类型不能为空`,
        };
      }
      if (hashName[proerties.name]) {
        return {
          code: -1,
          message: `属性名称不可重复`,
        };
      }
      if (
        proerties.type &&
        !_.isEmpty(proerties.defaultValue) &&
        !_.isEmpty(featureValuePattern(proerties.type))
      ) {
        if (!featureValuePattern(proerties.type).pattern.test(proerties.defaultValue)) {
          return {
            code: -1,
            message: `第${idx + 1}行 默认值输入错误：${
              featureValuePattern(proerties.type).message
            }`,
          };
        }
      }
      hashName[proerties.name] = true;
    }
    return { code: 1, message: '' };
  };

  const initEchoData = () => {
    setFeatureTagsList([]);
    if (!_.isEmpty(currentData)) {
      setDependenceSelectedList(form.getFieldValue('dependenceList'));
      setFeatureTagsList(currentData.featureTags);
      setFeatureType(currentData.featureType);
      setFeatureValueType(currentData.featureValueType);
      if (!_.isEmpty(currentData.params)) {
        setFeaturePropertiesList(
          currentData.params.map((item: any) => {
            return {
              ...item,
              id: (Math.random() * 1000000).toFixed(0),
            };
          }),
        );
      }
    }
  };

  /**
   * 验证特征名称是否重复
   */
  const checkFeatureNameIsRepeat = async () => {
    const feautreName = form.getFieldValue('featureName');
    const res = await searchFeature({
      appId: currentApp && currentApp.id,
      keywords: feautreName,
    });
    const isRepeat = _.isEmpty(res.data.filter((item: any) => item.featureName === feautreName));
    const featureNameError = isRepeat
      ? {}
      : {
          name: 'featureName',
          errors: ['特征名称重复，请更改后重试'],
        };
    const errorList = [featureNameError];
    // @ts-ignore
    form.setFields(errorList);
    return !isRepeat;
  };

  const {
    loading: dependenceLoading,
    run: dependenceRun,
    cancel: dependenceCancel,
  } = useRequest(searchFeature, {
    debounceInterval: 500,
    manual: true,
    formatResult: (res) => {
      const options = res.data.map((item: any) => {
        return {
          business_data: item,
          value: `${item.featureName}`,
          label: `${item.featureName}(${FeatureDataType[item.featureType]})`,
        };
      });
      //过滤函数类型与聚合类型
      setDependenceOptions(options.filter((item: any) => item.business_data.featureType <= 5));
    },
  });

  const handleSearchDependence = (value: string) => {
    setDependenceInputValue(value);
    if (!value) return;
    setDependenceOptions([]);
    dependenceRun({
      keywords: value,
      appId: currentApp && currentApp.id,
    });
  };

  const handleChangeDependence = () => {
    setDependenceInputValue('');
  };

  useEffect(() => {
    if (!_.isEmpty(currentData) && currentData.params && featurePropertiesList && isCopy) {
      setEditableRowKeys(featurePropertiesList.map((item: any) => item.id));
    }
  }, [currentData, featurePropertiesList, isCopy]);

  useEffect(() => {
    if (visible) {
      // setFormCheck(false);
      setIsClickSubmit(false);
      initEchoData();
    }
    if (!currentData) {
      form.setFieldsValue({ expression: '', featureValue: undefined });
      setFeaturePropertiesList([]);
      setFeaturePropertiesListError('');
    }
  }, [visible]);

  useEffect(() => {
    if (featureType >= 10) {
      dependenceRun({
        appId: currentApp && currentApp.id,
      });
    }
  }, [featureType]);

  const onSubmit = async (values: any) => {
    if (!currentData && (await checkFeatureNameIsRepeat())) {
      return false;
    }
    if (validateProertiesList().code < 0) {
      setFeaturePropertiesListError(validateProertiesList().message);
      return false;
    }
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在保存...', key: loadingKey, duration: 0 });
    const params = {
      ...values,
      readOnly: 0,
      appId: currentApp && currentApp.id,
    };
    if (featureType <= 5) {
      // 标签
      params.featureTags = (inputTagRef.current as any).changeVal();
    }
    if (featureType === 5) {
      // 属性列表
      params.params = featurePropertiesList;
    }
    if (featureType > 5) {
      params.expressionStruct = {
        expression: form.getFieldValue('expression'),
        dependenceList: form.getFieldValue('dependenceList'),
        resultType: form.getFieldValue('resultType'),
      };
    }
    let res;
    if (!currentData || isCopy) {
      res = await addFeature(params);
    } else {
      res = await editFeature(params);
    }
    if (res.code !== 1) {
      message.error({ content: res.message, key: loadingKey, duration: 2 });
      return false;
    }
    message.success({ content: '保存成功!' + (res.data || ''), key: loadingKey, duration: 3 });
    // setFeatureType(0);
    return true;
  };

  const onFinish = async (values: any) => {
    const success = await onSubmit(values);
    if (!success) {
      return false;
    }
    onVisibleChange(false);
    if (actionRef.current) {
      actionRef.current.reload();
    }
    return true;
  };

  const columns: ProColumns<Partial<FeatureProperties>>[] = [
    {
      title: '属性名称',
      dataIndex: 'name',
      tooltip: '英文、下划线开头,仅支持英文、数字、下划线',
      formItemProps: {
        rules: [
          {
            required: true,
            message: '必填项不能为空',
          },
          {
            pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
            message: '英文、下划线开头,仅支持英文、数字、下划线',
          },
        ],
      },
      // @ts-ignore
      // editable: !isView,
    },
    {
      title: '描述',
      dataIndex: 'desc',
      // @ts-ignore
      // editable: !isView,
    },
    {
      title: '属性类型',
      dataIndex: 'type',
      valueEnum: FeaturePropertiesType,
      fieldProps: {
        options: Object.keys(FeaturePropertiesType).map((key) => {
          return {
            value: Number(key),
            label: FeaturePropertiesType[key],
          };
        }),
      },
      // @ts-ignore
      // editable: !isView,
    },
    // {
    //   title: '默认值',
    //   dataIndex: 'defaultValue',
    //   // @ts-ignore
    //   // editable: !isView,
    // },
    {
      title: '操作',
      valueType: 'option',
      width: '10%',
      // @ts-ignore
      editable: !isView,
      render: (text, record) => {
        const deleteBtn = (
          <a
            key="delete"
            onClick={() => {
              setFeaturePropertiesList(
                featurePropertiesList.filter((item: any) => item.id !== record.id),
              );
            }}
          >
            删除
          </a>
        );
        return !isView && !_.isEmpty(currentData) && currentData.isModify ? [deleteBtn] : [];
      },
    },
  ];

  const featureValueRender = () => {
    let featureValueSelect;
    if (featureType === 4) {
      featureValueSelect = (
        <ProFormSelect
          name="featureValue"
          label="默认值"
          placeholder={(isView || currentData) && ''}
          width="md"
          options={Object.keys(FeatureDefaultValue).map((key) => {
            return {
              value: key,
              label: FeatureDefaultValue[key],
            };
          })}
          disabled={isView && currentData ? true : false}
        />
      );
    }
    if (featureType <= 3) {
      featureValueSelect = (
        <ProFormText
          name="featureValue"
          label="默认值"
          width="md"
          className="feature-value"
          rules={[featureValuePattern(featureType)]}
          disabled={isView && currentData ? true : false}
        />
      );
    }

    if (featureType <= 4) {
      return (
        <div>
          <ProFormRadio.Group
            name="featureValueType"
            label="默认值类型"
            options={Object.keys(FeatureValueType).map((key) => {
              return {
                value: Number(key),
                label: FeatureValueType[key],
              };
            })}
            fieldProps={{
              onChange: (e) => {
                setFeatureValueType(e.target.value);
              },
            }}
            width="md"
            disabled={isView && currentData ? true : false}
          />
          {featureValueType === 0 && featureValueSelect}
        </div>
      );
    }
    return <></>;
  };

  const propertiesRender = () => {
    if (featureType === 5) {
      return (
        <ProForm.Group>
          <EditableProTable<Partial<FeatureProperties>>
            headerTitle={
              <div>
                <span>属性列表</span>
                <span style={{ color: 'red', display: 'block' }}>{featurePropertiesListError}</span>
              </div>
            }
            actionRef={editableActionRef}
            rowKey="id"
            recordCreatorProps={
              isView && currentData.featureType !== 5
                ? false
                : {
                    newRecordType: 'dataSource',
                    record: (index) => ({
                      id: (Math.random() * 1000000).toFixed(0),
                      index,
                    }),
                  }
            }
            columns={columns}
            value={featurePropertiesList}
            onChange={setFeaturePropertiesList}
            editable={{
              type: 'multiple',
              editableKeys,
              actionRender: (row, config, defaultDoms) => {
                return [defaultDoms.delete];
              },
              onValuesChange: (record, recordList) => {
                setFeaturePropertiesList(recordList);
                setFeaturePropertiesListError('');
              },
              onChange: setEditableRowKeys,
            }}
          />
        </ProForm.Group>
      );
    }
    return <></>;
  };

  const handleFormChangeValue = () => {
    const formFeatureType = form.getFieldValue('featureType');
    formFeatureType && setFeatureType(formFeatureType);
  };

  const handleModalClose = (visibleValue: boolean) => {
    onVisibleChange(visibleValue);
    if (!visibleValue) {
      onVisibleChange(false);
      setFeatureType(0);
      setFeatureValueType(0);
      setFeatureTagsList([]);
      setFeaturePropertiesList([]);
      setEditableRowKeys([]);
      setDependenceOptions([]);
      setDependenceInputValue('');
      setDependenceSelectedList([]);
      setFeaturePropertiesListError('');
      setIsCopy(false);
    }
  };

  return (
    <ModalForm
      title={title}
      visible={visible}
      onVisibleChange={(visibleValue) => {
        form.resetFields();
        handleModalClose(visibleValue);
      }}
      form={form}
      onFinish={onFinish}
      initialValues={initialValues}
      onValuesChange={handleFormChangeValue}
      submitter={{
        render: (props, defaultDoms) => {
          const confirmObj = {
            1: '字符串',
            2: '整数',
            3: '浮点数',
            4: '布尔',
            5: 'Object',
            10: '函数表达式',
            11: '聚合函数表达式',
          };
          let confirmTitle;
          if (featureType < 10) {
            confirmTitle = '特征不可修改，请再次确认特征名称的正确性';
          } else {
            confirmTitle = `特征不可修改，请再次确认${confirmObj[featureType]}的正确性`;
          }
          return [
            isView ? (
              <Button key="close" onClick={() => handleModalClose(false)}>
                关闭
              </Button>
            ) : (
              <>
                <Button key="closeBtn" onClick={() => handleModalClose(false)}>
                  取消
                </Button>
                <Popconfirm
                  title={confirmTitle}
                  onConfirm={() => props.submit()}
                  onCancel={() => {}}
                  okText="确认"
                  cancelText="取消"
                  key="submitConfirmBtn"
                >
                  <Button key="submitBtn" type="primary">
                    确认
                  </Button>
                </Popconfirm>
              </>
            ),
          ];
        },
      }}
    >
      <ProFormText name="id" hidden />
      <ProForm.Group>
        <ProFormText
          name="featureName"
          label="名称"
          width="md"
          rules={[
            {
              required: true,
            },
            {
              pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
              message: '英文、下划线开头,仅支持英文、数字、下划线',
            },
          ]}
          tooltip={{
            title: '英文、下划线开头,仅支持英文、数字、下划线',
            icon: <InfoCircleTwoTone />,
          }}
          disabled={!isCopy && currentData ? true : false}
          fieldProps={{
            onBlur: checkFeatureNameIsRepeat,
          }}
        />
        <ProFormText
          name="featureDesc"
          label="描述"
          width="md"
          rules={[
            {
              required: true,
            },
          ]}
          disabled={isView && currentData ? true : false}
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormSelect
          name="featureType"
          label="类型"
          width="md"
          rules={[
            {
              required: true,
            },
          ]}
          options={Object.keys(FeatureDataType).map((key) => {
            return {
              value: Number(key),
              label: FeatureDataType[key],
            };
          })}
          disabled={isView && currentData ? true : false}
          fieldProps={{
            onChange: (value) => {
              if (value) {
                switch (value) {
                  case 1:
                    form.setFieldsValue({ featureValue: '' });
                    break;
                  case 2:
                    form.setFieldsValue({ featureValue: '0' });
                    break;
                  case 3:
                    form.setFieldsValue({ featureValue: '0.0' });
                    break;
                  case 4:
                    form.setFieldsValue({ featureValue: 'false' });
                    break;
                  case 5:
                    form.setFieldsValue({ source: 1 });
                    break;
                }
              }
            },
          }}
        />
        <ProFormSelect
          name="source"
          label="加载方式"
          width="md"
          rules={[
            {
              required: true,
            },
          ]}
          // showSearch
          options={Object.keys(FeatureSource).map((key) => {
            return {
              value: Number(key),
              label: FeatureSource[key],
            };
          })}
          disabled={featureType === 5 || (isView && currentData) ? true : false}
        />
      </ProForm.Group>
      {featureType <= 5 ? (
        <>
          {featureValueRender()}
          <ProForm.Group>
            <div className="form-row-label feature-item">
              <div className="ant-col ant-form-item-label" style={{ width: '100%' }}>
                <label htmlFor="source" title="标签">
                  标签
                </label>
              </div>
              <div style={{ float: 'left' }}>
                <InputTag
                  tagValue={featureTagsList}
                  setFeatureTagsList={setFeatureTagsList}
                  checkNull={featureTagsList.length === 0 && isClickSubmit}
                  ref={inputTagRef}
                  isView={isView && currentData ? true : false}
                />
              </div>
            </div>
            {!_.isEmpty(currentData) && (
              <ProFormRadio.Group
                name="readOnly"
                label="是否只读"
                options={Object.keys(FeatureReadOnly).map((key) => {
                  return {
                    value: Number(key),
                    label: FeatureReadOnly[key],
                  };
                })}
                disabled={true}
              />
            )}
          </ProForm.Group>
        </>
      ) : (
        <>
          <ProFormText
            name="expression"
            label="表达式"
            tooltip={{
              title: expressionTooltip,
              icon: <InfoCircleTwoTone />,
            }}
            placeholder={expressionTooltip}
            width={687}
            rules={[
              {
                required: true,
              },
              featureValuePattern(featureType),
            ]}
            disabled={isView && currentData ? true : false}
          />
          <ProForm.Group>
            <ProFormSelect
              name="dependenceList"
              label="依赖特征"
              width="md"
              mode="multiple"
              placeholder={isView && currentData ? '' : '请输入特征名称'}
              rules={
                featureType === 10
                  ? []
                  : [
                      {
                        required: true,
                      },
                    ]
              }
              showSearch
              options={dependenceOptions}
              fieldProps={{
                showArrow: true,
                filterOption: false,
                searchValue: dependenceInputValue,
                onChange: handleChangeDependence,
                onSearch: (value) => handleSearchDependence(value),
                onBlur: dependenceCancel,
                onClear: async () => {
                  await dependenceRun({
                    appId: currentApp && currentApp.id,
                  });
                },
                onClick: async () => {
                  if (!form.getFieldValue('dependenceList')) {
                    await dependenceRun({
                      appId: currentApp && currentApp.id,
                    });
                  }
                },
                onDeselect: () => {
                  setDependenceSelectedList(form.getFieldValue('dependenceList'));
                },
                onSelect: () => {
                  setDependenceSelectedList(form.getFieldValue('dependenceList'));
                },
                loading: dependenceLoading,
                notFoundContent: dependenceLoading ? <Spin size="small" /> : <></>,
              }}
              disabled={isView && currentData ? true : false}
            />
            <ProFormSelect
              name="resultType"
              label="返回值类型"
              width="md"
              rules={[
                {
                  required: true,
                },
              ]}
              // @ts-ignore
              options={Object.keys(FeatureDataType)
                .map((key) => {
                  return {
                    value: Number(key),
                    label: FeatureDataType[key],
                  };
                })
                .filter((item) => item.value < 5)}
              disabled={isView && currentData ? true : false}
            />
          </ProForm.Group>
          <>
            {dependenceSelectedList.map((item: string, index: number) => {
              return (
                <Space key={index}>
                  <Paragraph copyable>{item}</Paragraph>&nbsp;
                </Space>
              );
            })}
          </>
        </>
      )}
      {propertiesRender()}
    </ModalForm>
  );
};

export default connect(({ app }: ConnectState) => ({
  currentApp: app.currentApp,
}))(EditFeature);
