import React, { useEffect, useMemo, useState } from 'react';
import { connect } from 'umi';
import type { ConnectProps } from 'umi';
import { ConnectState } from '@/models/connect';
import { Button, Form, message } from 'antd';
import { EditableProTable, ProColumns } from '@ant-design/pro-table';
import ProForm, { ModalForm, ProFormSelect, ProFormText } from '@ant-design/pro-form';
import ProCard from '@ant-design/pro-card';
import { GroupInfo } from '@/models/group';
import { AppInfo } from '@/models/app';
import { ActionInfo, ActionParam } from '@/models/action';
import { addAction, editAction, queryActionList } from '@/services/action';
import { ActionInfoType, ActionParamType } from '@/consts/action/const';
import _ from 'lodash';

export type AppCreateModalFormProps = {
  actionRef: any;
  title: string;
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  currentData: ActionInfo;
  isView: boolean;
  isCopy: boolean;
  setIsCopy: (isCopy: boolean) => void;
  currentGroup?: GroupInfo;
  currentApp?: AppInfo;
} & Partial<ConnectProps>;

const AppCreateModalForm: React.FC<AppCreateModalFormProps> = (props) => {
  const {
    actionRef,
    title,
    visible,
    onVisibleChange,
    currentData,
    isView,
    isCopy,
    setIsCopy,
    currentGroup,
    currentApp,
  } = props;
  const [form] = Form.useForm();
  const initialValues = !_.isEmpty(currentData)
    ? {
        ...currentData,
        functionName: !_.isEmpty(currentData.param) ? currentData.param.functionName : '',
      }
    : { type: 1 };

  const [type, setType] = useState<number>();
  const [dataSource, setDataSource] = useState<Partial<ActionParam>[]>([]);
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [actionParamsListError, setActionParamsListError] = useState<string>('');

  const checkActionNameIsRepeat = async () => {
      const name = form.getFieldValue('name');
      const res = await queryActionList({
        groupId: currentGroup && currentGroup.groupId,
        appId: currentApp && currentApp.id,
        pageSize: 10,
        pageIndex: 0,
        name: name,
      });
      const isRepeat = _.isEmpty(res.data.datas.filter((item: any) => item.name === name));
      const nameError = isRepeat
        ? {}
        : {
            name: 'name',
            errors: ['动作名称重复，请更改后重试'],
          };
      const errorList = [nameError];
      // @ts-ignore
      form.setFields(errorList);
      return !isRepeat;
  };

  /**
   * 验证参数列表
   */
  const validateParamsList = () => {
    let hashName = {};
    for (let idx = 0; idx < dataSource.length; idx += 1) {
      const proerties: any = { ...dataSource[idx] };

      if (!proerties.name || !proerties.name.length) {
        return {
          code: -1,
          message: `参数名称名称不能为空`,
        };
      }
      if (!proerties.type) {
        return {
          code: -1,
          message: `参数类型不能为空`,
        };
      }
      if (hashName[proerties.name]) {
        return {
          code: -1,
          message: `参数名称不可重复`,
        };
      }
      hashName[proerties.name] = true;
    }
    return { code: 1, message: '' };
  };

  useMemo(() => {
    if (!_.isEmpty(currentData) && currentData.param.paramList && dataSource && isCopy) {
      setEditableRowKeys(dataSource.map((item: any) => item.id));
    }
  }, [currentData, dataSource, isCopy]);

  useEffect(() => {
    if (visible) {
      if (!_.isEmpty(currentData)) {
        setType(currentData.type);
      }
      if (!_.isEmpty(currentData) && currentData?.param) {
        setDataSource(
          currentData?.param.paramList.map((item: any) => {
            return {
              ...item,
              id: (Math.random() * 1000000).toFixed(0),
            };
          }),
        );
        // setEditableRowKeys(featurePropertiesList.map((item: any) => item.id));
        // setEditableRowKeys(currentData?.param.paramList.map((item: any) => item.id));
      }
    }
  }, [visible]);

  const columns: ProColumns<Partial<ActionParam>>[] = [
    {
      title: '参数名',
      dataIndex: 'name',
      align: 'center',
      tooltip: '英文开头，支持英文、数字、下划线，英文区分大小写',
      formItemProps: {
        rules: [
          {
            required: true,
            message: '必填项不能为空',
          },
          {
            pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
            message: '英文开头，支持英文、数字、下划线，英文区分大小写',
          },
        ],
      },
      // @ts-ignore
      editable: !isView,
    },
    {
      title: '类型',
      dataIndex: 'type',
      align: 'center',
      valueType: 'select',
      fieldProps: {
        options: Object.keys(ActionParamType).map((key) => {
          return {
            value: Number(key),
            label: ActionParamType[key],
          };
        }),
      },
      // @ts-ignore
      editable: !isView,
    },
    {
      title: '操作',
      align: 'center',
      valueType: 'option',
      width: 200,
      // @ts-ignore
      editable: !isView,
    },
  ];

  const onSubmit = async (values: any) => {
    if (!currentData && (await checkActionNameIsRepeat())) {
      return false;
    }
    if (validateParamsList().code < 0) {
      setActionParamsListError(validateParamsList().message);
      return false;
    }
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在保存...', key: loadingKey, duration: 0 });
    const params = {
      ...values,
      actionId: currentData && currentData.id,
      appId: currentApp && currentApp.id,
      name: values.name.replace(/\s+/g, ''),
      param: {
        functionName: values.functionName,
        paramList: dataSource,
      },
    };
    const res = !currentData || isCopy ? await addAction(params) : await editAction(params);
    if (res.code !== 1) {
      message.error({ content: res.message, key: loadingKey, duration: 2 });
      return false;
    }
    message.success({ content: '保存成功!', key: loadingKey, duration: 2 });
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

  const handleFormChangeType = (value: any, option: any) => {
    const formType = form.getFieldValue('type');
    if (formType === 2) {
      form.setFieldsValue({ functionName: 'Facts.Set' });
    } else {
      form.setFieldsValue({ functionName: '' });
    }
    setType(formType);
  };

  return (
    <ModalForm
      title={title}
      visible={visible}
      onVisibleChange={(visibleValue) => {
        form.resetFields();
        onVisibleChange(visibleValue);
        if (!visibleValue) {
          setDataSource([]);
          setEditableRowKeys([]);
          setType(0);
          setActionParamsListError('');
          setIsCopy(false);
        }
      }}
      form={form}
      onFinish={onFinish}
      initialValues={initialValues}
      submitter={{
        render: (props, defaultDoms) => {
          return [
            isView ? (
              <Button
                key="close"
                onClick={() => {
                  onVisibleChange(false);
                  setDataSource([]);
                  setEditableRowKeys([]);
                }}
              >
                关闭
              </Button>
            ) : (
              defaultDoms
            ),
          ];
        },
      }}
    >
      <ProForm.Group>
        <ProFormText
          name="name"
          label="动作名称"
          width="md"
          rules={[
            {
              required: true,
            },
          ]}
          // 不能使用onBlur 原因：取消时调用两次接口
          // fieldProps={{
          //   onBlur: checkActionNameIsRepeat,
          // }}
          disabled={!isCopy && currentData ? true : false}
        />
        <ProFormSelect
          name="type"
          label="动作类型"
          width="md"
          options={Object.keys(ActionInfoType).map((key) => {
            return {
              value: Number(key),
              label: ActionInfoType[key],
            };
          })}
          rules={[
            {
              required: true,
            },
          ]}
          fieldProps={{
            onChange: (value, option) => handleFormChangeType(value, option),
          }}
          disabled={!isCopy && currentData ? true : false}
        />
      </ProForm.Group>
      <ProCard title="动作签名(函数+参数列表)">
        <ProFormText
          name="functionName"
          label="函数名称"
          width="md"
          rules={[
            {
              required: true,
            },
            {
              pattern: /^[a-zA-Z][a-zA-Z0-9_.]*$/,
              message: '英文开头,仅支持英文、数字、下划线、点',
            },
          ]}
          // disabled={!isCopy && currentData ? true : false}
          disabled={(!isCopy && currentData) || type === 2 ? true : false}
        />
        <EditableProTable<Partial<ActionParam>>
          headerTitle={
            <div>
              <span>参数列表</span>
              <span style={{ color: 'red', display: 'block' }}>{actionParamsListError}</span>
            </div>
          }
          rowKey="id"
          recordCreatorProps={
            isView
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
          value={dataSource}
          onChange={setDataSource}
          editable={{
            type: 'multiple',
            editableKeys,
            actionRender: (row, config, defaultDoms) => {
              return [defaultDoms.delete];
            },
            onValuesChange: (record, recordList) => {
              setDataSource(recordList);
              setActionParamsListError('');
            },
            onChange: setEditableRowKeys,
          }}
        />
      </ProCard>
    </ModalForm>
  );
};

export default connect(({ app }: ConnectState) => ({
  currentApp: app.currentApp,
  currentGroup: app.currentGroup,
}))(AppCreateModalForm);
