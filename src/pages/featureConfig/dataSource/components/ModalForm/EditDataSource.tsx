import React, { useEffect, useState } from 'react';
import { useRequest } from 'umi';
import { Form, Input, message } from 'antd';
import ProForm, { ModalForm, ProFormSwitch, ProFormText } from '@ant-design/pro-form';
import ProCard from '@ant-design/pro-card';
import type { DataSourceInfo } from '@/models/featureConfig';
import { addDataSource, editDataSource, queryMetadataList } from '@/services/featureConfig';
import type { DataSourceParamsType, MetadataInfo } from '@/models/featureConfig';
import InParamList from '../EditableProTable/InParamList';
import ReturnParamList from '../EditableProTable/ReturnParamList';
import SecondaryInParamList from '../EditableProTable/SecondaryInParamList';
import SecondaryReturnParamList from '../EditableProTable/SecondaryReturnParamList';
import _ from 'lodash';

export type EditDataSourceProps = {
  actionRef: any;
  title: string;
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  currentData: DataSourceInfo;
};

type OptionType = {
  value: number;
  label: string;
};

const EditDataSource: React.FC<EditDataSourceProps> = (props) => {
  const { actionRef, title, visible, onVisibleChange, currentData } = props;
  const initialValues = currentData
    ? { ...currentData }
    : {
        port: '80',
        url: '/api/v1/load/facts',
      };
  const [form] = Form.useForm();
  const [metadataData, setMetadataData] = useState<MetadataInfo[]>([]);
  // 参数列表
  const [inParamMetadataOptions, setInParamMetadataOptions] = useState<OptionType[]>([]);
  const [inParamList, setInParamList] = useState<DataSourceParamsType[]>([]);
  const [isShowInParamAlias, setIsShowInParamAlias] = useState<boolean>(false);
  // 返回列表
  const [returnParamMetadataOptions, setReturnParamMetadataOptions] = useState<OptionType[]>([]);
  const [returnParamList, setReturnParamList] = useState<DataSourceParamsType[]>([]);
  const [isShowReturnParamAlias, setIsShowReturnParamAlias] = useState<boolean>(false);
  // 二级参数列表
  const [inParam2MetadataOptions, setInParam2MetadataOptions] = useState<OptionType[]>([]);
  const [inParam2List, setInParam2List] = useState<DataSourceParamsType[]>([]);
  const [isShowInParam2Alias, setIsShowInParam2Alias] = useState<boolean>(false);
  // 二级返回列表
  const [returnParam2MetadataOptions, setReturnParam2MetadataOptions] = useState<OptionType[]>([]);
  const [returnParam2List, setReturnParam2List] = useState<DataSourceParamsType[]>([]);
  const [isShowReturnParam2Alias, setIsShowReturnParam2Alias] = useState<boolean>(false);

  const loadMetadataListData = async () => {
    const params = {
      pageSize: 10,
    };
    const res = await queryMetadataList(params);
    if (res && res.data && res.data.length > 0) {
      const options = res.data.map((item: any) => {
        return {
          value: item.id,
          label: item.englishLabel,
        };
      });
      setMetadataData(
        res.data.map((item: any, index: number) => {
          return {
            ...item,
            metadataId: item.id,
            index,
          };
        }),
      );
      setInParamMetadataOptions(options);
      setReturnParamMetadataOptions(options);
      setInParam2MetadataOptions(options);
      setReturnParam2MetadataOptions(options);
    }
  };

  const { loading: featureLoading, run: featureRun, cancel: featureCancel } = useRequest(
    queryMetadataList,
    {
      debounceInterval: 500,
      manual: true,
      formatResult: (res) => {
        const options = res.data.map((item: any) => {
          return {
            value: item.id,
            label: item.englishLabel,
          };
        });
        setInParamMetadataOptions(options);
        setReturnParamMetadataOptions(options);
        setInParam2MetadataOptions(options);
        setReturnParam2MetadataOptions(options);
      },
    },
  );

  const handleSearchMetadata = (value: string) => {
    if (value.length === 0) return;
    setInParamMetadataOptions([]);
    setReturnParamMetadataOptions([]);
    setInParam2MetadataOptions([]);
    featureRun({
      pageSize: 10,
      englishLabel: value,
    });
  };

  const handleFormChangeValue = () => {
    const isInParamsAlias = form.getFieldValue('isInParamsAlias');
    const isReturnParamsAlias = form.getFieldValue('isReturnParamsAlias');
    const isPrefixInParamsAlias = form.getFieldValue('isPrefixInParamsAlias');
    const isPrefixReturnParamsAlias = form.getFieldValue('isPrefixReturnParamsAlias');
    setIsShowInParamAlias(isInParamsAlias === undefined ? false : isInParamsAlias);
    setIsShowReturnParamAlias(isReturnParamsAlias === undefined ? false : isReturnParamsAlias);
    setIsShowInParam2Alias(isPrefixInParamsAlias === undefined ? false : isPrefixInParamsAlias);
    setIsShowReturnParam2Alias(
      isPrefixReturnParamsAlias === undefined ? false : isPrefixReturnParamsAlias,
    );
  };

  const initEchoInParamList = () => {
    setInParamList([
      {
        id: Date.now(),
        metadataId: null,
        name: '',
        englishLabel: '',
        alias: '',
        prefixAlias: '',
        index: 0,
      },
    ]);
    if (!_.isEmpty(currentData)) {
      // 由于EditableProTable是按index赋值 所以需relyFeatureList需有index标示
      const tempCurrentInParams = currentData.inParams.map((item: any, index: any) => {
        return {
          ...item,
          index,
        };
      });
      // 合并当前行与接口数据
      const uniqInParams = _.concat(tempCurrentInParams, metadataData);
      // 返回一个包含所有传入数组交集元素的新数组
      const tempInParams = _.intersectionBy(uniqInParams, tempCurrentInParams, 'metadataId');
      const options: any = tempInParams.map((item) => {
        return {
          value: item.id,
          label: item.englishLabel,
        };
      });
      setInParamList(tempInParams);
      setInParamMetadataOptions(options);
      // setMetadataOptions(_.uniq(_.concat(metadataOptions, options)));
    }
  };

  const initEchoReturnParamList = () => {
    setReturnParamList([
      {
        id: Date.now(),
        metadataId: null,
        name: '',
        englishLabel: '',
        alias: '',
        prefixAlias: '',
        index: 0,
      },
    ]);
    if (!_.isEmpty(currentData)) {
      const tempCurrentReturnParams = currentData.returnParams.map((item: any, index: any) => {
        return {
          ...item,
          index,
        };
      });
      const uniqReturnParams = _.concat(tempCurrentReturnParams, metadataData);
      const tempReturnParams = _.intersectionBy(
        uniqReturnParams,
        tempCurrentReturnParams,
        'metadataId',
      );
      const options: any = tempReturnParams.map((item) => {
        return {
          value: item.id,
          label: item.englishLabel,
        };
      });
      setReturnParamList(tempReturnParams);
      setReturnParamMetadataOptions(options);
    }
  };

  const initEchoInParam2List = () => {
    setInParam2List([]);
    if (!_.isEmpty(currentData)) {
      const tempCurrentSecondaryInParams = currentData.secondaryInParams.map(
        (item: any, index: any) => {
          return {
            ...item,
            index,
          };
        },
      );
      const uniqSecondaryInParams = _.concat(tempCurrentSecondaryInParams, metadataData);
      const tempSecondaryInParams = _.intersectionBy(
        uniqSecondaryInParams,
        tempCurrentSecondaryInParams,
        'metadataId',
      );
      const options: any = tempSecondaryInParams.map((item) => {
        return {
          value: item.id,
          label: item.englishLabel,
        };
      });
      setInParam2List(tempSecondaryInParams);
      setInParam2MetadataOptions(options);
    }
  };

  const initEchoReturnParam2List = () => {
    setReturnParam2List([]);
    if (!_.isEmpty(currentData)) {
      const tempCurrentSecondaryReturnParams = currentData.secondaryReturnParams.map(
        (item: any, index: any) => {
          return {
            ...item,
            index,
          };
        },
      );
      const uniqSecondaryReturnParams = _.concat(tempCurrentSecondaryReturnParams, metadataData);
      const tempSecondaryReturnParams = _.intersectionBy(
        uniqSecondaryReturnParams,
        tempCurrentSecondaryReturnParams,
        'metadataId',
      );
      const options: any = tempSecondaryReturnParams.map((item) => {
        return {
          value: item.id,
          label: item.englishLabel,
        };
      });
      setReturnParam2List(tempSecondaryReturnParams);
      setReturnParam2MetadataOptions(options);
    }
  };

  const initEchoParamsAlias = () => {
    handleFormChangeValue();
  };

  // @ts-ignore
  useEffect(async () => {
    if (visible) {
      await loadMetadataListData();
      initEchoInParamList();
      initEchoReturnParamList();
      initEchoInParam2List();
      initEchoReturnParam2List();
      initEchoParamsAlias();
    }
  }, [visible, currentData]);

  const onSubmit = async (values: any) => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在保存...', key: loadingKey, duration: 0 });
    const params = {
      ...values,
      inParams: inParamList,
      returnParams: returnParamList,
      secondaryInParams: inParam2List,
      secondaryReturnParams: returnParam2List,
    };
    return false;
    let res;
    if (!currentData) {
      res = await addDataSource(params);
    } else {
      res = await editDataSource(params);
    }
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

  return (
    <ModalForm
      title={title}
      visible={visible}
      onVisibleChange={(visibleValue) => {
        form.resetFields();
        onVisibleChange(visibleValue);
      }}
      form={form}
      onFinish={onFinish}
      initialValues={initialValues}
      onValuesChange={handleFormChangeValue}
      width="78%"
    >
      <ProFormText name="id" hidden />
      <ProForm.Group>
        <ProFormText
          name="name"
          label="中文名称"
          width="md"
          rules={[
            {
              required: true,
              message: '中文名称为必填项',
            },
          ]}
        />
        <ProFormText
          name="englishName"
          label="英文名称"
          width="md"
          rules={[
            {
              required: true,
              message: '英文名称为必填项',
            },
          ]}
        />
        <Input.Group compact>
          <ProFormText
            name="serverAddress"
            label="服务地址"
            placeholder="域名或vipServer"
            width="sm"
            rules={[
              {
                required: true,
                message: '服务地址为必填项',
              },
            ]}
            tooltip="域名或vipServer"
          />
          <ProFormText
            name="port"
            label="端口"
            width="xs"
            rules={[
              {
                required: true,
                message: '端口为必填项',
              },
            ]}
          />
        </Input.Group>
      </ProForm.Group>
      <ProFormText
        name="url"
        label="url"
        width="md"
        rules={[
          {
            required: true,
            message: 'url为必填项',
          },
        ]}
        hidden
        disabled
      />
      <div style={{ float: 'left', width: '100%' }}>
        <div style={{ float: 'left', width: '50%' }}>
          <InParamList
            inParamList={inParamList}
            setInParamList={setInParamList}
            isShowInParamAlias={isShowInParamAlias}
            inParamMetadataOptions={inParamMetadataOptions}
            handleSearchMetadata={handleSearchMetadata}
            featureCancel={featureCancel}
            featureLoading={featureLoading}
          />
        </div>
        <div style={{ float: 'right', width: '50%' }}>
          <ReturnParamList
            returnParamList={returnParamList}
            setReturnParamList={setReturnParamList}
            isShowReturnParamAlias={isShowReturnParamAlias}
            returnParamMetadataOptions={returnParamMetadataOptions}
            handleSearchMetadata={handleSearchMetadata}
            featureCancel={featureCancel}
            featureLoading={featureLoading}
          />
        </div>
      </div>
      <div style={{ float: 'left', width: '100%' }}>
        <div style={{ float: 'left', width: '50%' }}>
          {isShowInParam2Alias && (
            <SecondaryInParamList
              inParam2List={inParam2List}
              setInParam2List={setInParam2List}
              isShowInParam2Alias={isShowInParam2Alias}
              inParam2MetadataOptions={inParam2MetadataOptions}
              handleSearchMetadata={handleSearchMetadata}
              featureCancel={featureCancel}
              featureLoading={featureLoading}
            />
          )}
        </div>
        <div style={{ float: 'right', width: '50%' }}>
          {isShowReturnParam2Alias && (
            <SecondaryReturnParamList
              returnParam2List={returnParam2List}
              setReturnParam2List={setReturnParam2List}
              isShowReturnParam2Alias={isShowReturnParam2Alias}
              returnParam2MetadataOptions={returnParam2MetadataOptions}
              handleSearchMetadata={handleSearchMetadata}
              featureCancel={featureCancel}
              featureLoading={featureLoading}
            />
          )}
        </div>
      </div>
      <ProCard title="高级选项" headerBordered collapsible defaultCollapsed>
        <ProForm.Group size={120}>
          <ProFormSwitch name="isInParamsAlias" label="开启入参别名" />
          <ProFormSwitch name="isReturnParamsAlias" label="开启返回别名" />
          <ProFormSwitch name="isPrefixInParamsAlias" label="开启二级入参" />
          <ProFormSwitch name="isPrefixReturnParamsAlias" label="开启二级返回" />
        </ProForm.Group>
      </ProCard>
    </ModalForm>
  );
};

export default EditDataSource;
