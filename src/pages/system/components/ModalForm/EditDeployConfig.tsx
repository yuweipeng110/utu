import React, { useEffect, useState } from 'react';
import { useRequest } from 'umi';
import { Form, message, Spin, Empty, Button, Space, AutoComplete } from 'antd';
import { ModalForm, ProFormText, ProFormSelect } from '@ant-design/pro-form';
import ProTable, { ProColumns } from '@ant-design/pro-table';
import { DeployConfigInfo, GrayGroupType } from '@/models/deployConfig';
import { addDeployConfig, updateDeployConfig, getAoneGroup } from '@/services/deployConfig';
import { queryAppList } from '@/services/app';
import _ from 'lodash';

export type EditDeployConfigProps = {
  actionRef: any;
  title: string;
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  currentData?: DeployConfigInfo;
};

const AddDeployConfig: React.FC<EditDeployConfigProps> = (props) => {
  const { actionRef, title, visible, onVisibleChange, currentData } = props;
  const [form] = Form.useForm();
  const initialValues = !_.isEmpty(currentData) ? { ...currentData } : {};
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [appOptions, setAppOptions] = useState([]);
  const [isClickGrayGroup, setIsClickGrayGroup] = useState<boolean>(false);
  const [grayGroupValue, setGrayGroupValue] = useState('');
  const [grayGroupOptions, setGrayGroupOptions] = useState([]);
  const [grayGroupList, setGrayGroupList] = useState<GrayGroupType[]>([]);

  const {
    loading: appLoading,
    run: appRun,
    cancel: appCancel,
  } = useRequest(queryAppList, {
    debounceInterval: 500,
    manual: true,
    formatResult: (res) => {
      const newOptions = res.data.datas[0].voList.map((item: any) => {
        let desc = item.appDesc ? `（${item.appDesc}）` : '';
        return {
          business_data: item,
          value: item.id,
          label: `${item.appCode}${desc}`,
          option_label: item.appCode,
        };
      });
      setAppOptions(newOptions);
    },
  });

  useEffect(() => {
    if (visible) {
      appRun({
        pageSize: 10,
        pageIndex: 0,
      });
      if (!_.isEmpty(currentData?.groupList)) {
        setIsClickGrayGroup(true);
        setGrayGroupList(currentData?.groupList as any);
      }
    }
  }, [visible]);

  const handleSearchApp = (value: string) => {
    if (value.length === 0) return;
    setAppOptions([]);
    appRun({
      pageSize: 10,
      pageIndex: 0,
      searchParam: value,
    });
  };

  const getAoneGroupRequest = async () => {
    const aoneAppName = form.getFieldValue('aoneAppName');
    setIsLoading(true);
    const res = await getAoneGroup({
      appName: aoneAppName,
    });
    setIsLoading(false);
    setIsClickGrayGroup(true);
    setGrayGroupOptions(res.data);
  };

  const onSubmit = async (values: any) => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在保存...', key: loadingKey, duration: 0 });
    const params = {
      ...values,
      groupList: grayGroupList.map((item, index) => {
        return {
          ...item,
          index,
        };
      }),
    };
    if (currentData) {
      params.configId = currentData.id;
    }
    const res = !currentData ? await addDeployConfig(params) : await updateDeployConfig(params);
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

  const addGrayGroupList = () => {
    let checkResult = false;
    if (grayGroupValue) {
      const newGrayGroup = {
        index: grayGroupList.length,
        name: grayGroupValue,
      };
      const newData: any =
        grayGroupList.map((item: any) => {
          if (grayGroupValue === item.name) {
            checkResult = true;
          }
          return item;
        }) || [];
      if (checkResult) {
        message.error('不能添加相同数据');
        return false;
      }
      newData.push(newGrayGroup);
      setGrayGroupList(newData);
      // 重置选择
      setGrayGroupValue('');
      return true;
    }
    return false;
  };

  const removeGrayGroupList = (index: number) => {
    const newData: any = grayGroupList
      ?.filter((item: any) => item.index !== index)
      .map((item, index) => {
        return {
          ...item,
          index,
        };
      });
    setGrayGroupList(newData);
  };

  const grayGroupListColumns: ProColumns<GrayGroupType>[] = [
    {
      title: '灰度分组',
      dataIndex: 'name',
    },
    {
      title: '操作',
      align: 'center',
      valueType: 'option',
      render: (_, record) => {
        const deleteBtn = (
          <Button key="deleteBtn" type="link" onClick={() => removeGrayGroupList(record.index)}>
            删除
          </Button>
        );
        return <Space size="small">{deleteBtn}</Space>;
      },
    },
  ];

  return (
    <ModalForm
      title={title}
      visible={visible}
      onVisibleChange={(visibleValue) => {
        form.resetFields();
        onVisibleChange(visibleValue);
        if (!visibleValue) {
          setIsClickGrayGroup(false);
        }
      }}
      form={form}
      onFinish={onFinish}
      initialValues={initialValues}
    >
      <Spin spinning={isLoading}>
        <ProFormSelect
          name="appId"
          label="选择应用"
          showSearch
          options={appOptions}
          rules={[
            {
              required: true,
            },
          ]}
          fieldProps={{
            optionLabelProp: 'option_label',
            showArrow: true,
            filterOption: false,
            onSearch: (value) => handleSearchApp(value),
            onBlur: appCancel,
            onClear: async () => {
              await appRun({
                pageSize: 10,
                pageIndex: 0,
              });
            },
            onClick: async () => {
              if (!form.getFieldValue('appId')) {
                await appRun({
                  pageSize: 10,
                  pageIndex: 0,
                });
              }
            },
            loading: appLoading,
            notFoundContent: appLoading ? <Spin size="small" /> : <Empty />,
          }}
        />
        <ProFormText
          name="aoneAppName"
          label="关联Aone应用名称"
          rules={[{ required: true }]}
          addonAfter={
            <Button type="primary" onClick={getAoneGroupRequest}>
              获取分组信息
            </Button>
          }
        />
        {isClickGrayGroup && (
          <>
            <p>选择灰度分组</p>
            <AutoComplete
              options={grayGroupOptions}
              value={grayGroupValue}
              onChange={(value) => setGrayGroupValue(value)}
              style={{ width: 400, marginBottom: 20 }}
            />
            &nbsp;&nbsp;<a onClick={addGrayGroupList}>添加一行</a>
            <ProTable<GrayGroupType>
              rowKey="index"
              columns={grayGroupListColumns}
              dataSource={grayGroupList}
              pagination={false}
              options={false}
              search={false}
              size="small"
            />
          </>
        )}
      </Spin>
    </ModalForm>
  );
};

export default AddDeployConfig;
