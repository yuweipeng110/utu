import React, { useEffect, useState } from "react";
import { connect } from 'umi';
import type { ConnectProps } from 'umi';
import type { ConnectState } from '@/models/connect';
import { Button, Form, Spin } from "antd";
import ProForm, { ProFormSelect } from "@ant-design/pro-form";
import { PlusOutlined } from "@ant-design/icons";
import { AppInfo } from "@/models/app";
import ActionGroupForm from "@/pages/app/components/Form/ActionGroupForm";
import _ from 'lodash';
import '../../index.less';

export type ActionFormProps = {
  actionName: string;
  formName: string,
  actionList: any;
  onActionItemChange: (value: any) => void;
  ruleIsView: boolean;
  actionIsShow: boolean;
  setActionIsShow: (actionIsShow: boolean) => void;
  actionOptions: any;
  setActionOptions: any;
  actionLoading: boolean;
  actionRun: any;
  actionCancel: any;
  customActionIsShow: boolean;
  setCustomActionIsShow: (customActionIsShow: boolean)=> void;
  currentApp?: AppInfo;
} & Partial<ConnectProps>;

const ActionForm: React.FC<ActionFormProps> = (props) => {
  const {
    actionName,
    formName,
    actionList,
    onActionItemChange,
    ruleIsView,
    currentApp,
    actionIsShow,
    setActionIsShow,
    actionOptions,
    setActionOptions,
    actionLoading,
    actionRun,
    actionCancel,
    customActionIsShow,
    setCustomActionIsShow
  } = props;
  const [formItem] = Form.useForm();

  const [selectedAction, setSelectedAction] = useState(null);

  const handleChangeAction = (value: any, option: any) => {
    if(!option) {
      return;
    }
    const newAction: any = {
      index: actionList.length || 0,
      actionId: option.action_id,
      actionName: option.action_name,
      functionName: option.function_name,
      actionType: option.action_type,
      paramList: option.param_list.map((param: any) => {
        let defaultValue = '';
        if (formName === 'leftActionList' && param.type === 4) {
          defaultValue = 'true';
        } else if (formName === 'rightActionList' && param.type === 4) {
          defaultValue = 'false';
        } else {
          defaultValue = '';
        }
        return {
          ...param,
          value: defaultValue,
          source: 0
        }
      }),
    }
    setSelectedAction(newAction);
  }

  const addAction = () => {
    if (selectedAction) {
      setSelectedAction(null);
      onActionItemChange([...actionList, selectedAction]);
    }
  }

  const onGroupChange = () => {
    const newActionGroups = formItem.getFieldValue(formName).map((item: any, index: number) => {
      return {
        ...item,
        index,
      }
    }) || [];
    formItem.setFieldsValue({ [formName]: newActionGroups });
    if (onActionItemChange) {
      onActionItemChange([...newActionGroups]);
    }
  };

  useEffect(() => {
    if (formName === "rightActionList") {
      setActionIsShow(_.isEmpty(actionList));
    }
    formItem.setFieldsValue({ [formName]: actionList }); // 回显ActionList
  }, [actionList]);

  const handleSearchAction = (value: string) => {
    if (!value) return;
    setActionOptions([]);
    actionRun({
      appId: currentApp && currentApp.id,
      pageSize: 10,
      pageIndex: 0,
      name: value
    });
  };

  const actionRender = () => {
    return (
      <Form form={formItem}>
        <Form.Item shouldUpdate>
          <Form.List name={formName}>
            {(fields, { add, remove, move }) => {
              const actions = formItem.getFieldValue([formName]);
              return (
                <>
                  {!ruleIsView ? (
                    <div className="add-action">
                      <ProForm.Group>
                        <ProFormSelect
                          name="action"
                          label={actionName}
                          width="sm"
                          placeholder="请输入动作名称"
                          showSearch
                          options={actionOptions}
                          fieldProps={{
                            showArrow: true,
                            filterOption: false,
                            onChange: (value, option) => handleChangeAction(value, option),
                            onSearch: (value) => handleSearchAction(value),
                            onBlur: actionCancel,
                            loading: actionLoading,
                            notFoundContent: actionLoading ? <Spin size="small" /> : null,
                          }}
                          disabled={ruleIsView}
                        />
                        <Button type="primary" size="small" shape="round" onClick={addAction}>
                          <PlusOutlined />添加{actionName}
                        </Button>
                        <Button type={customActionIsShow ? 'primary' : 'default'} size="small" shape="round" onClick={() => {
                          setCustomActionIsShow(!customActionIsShow);
                        }}>
                          自定义{actionName}
                        </Button>
                      </ProForm.Group>
                    </div>
                  ) : actionName
                  }
                  {fields.map((field, fieldIndex) => {
                    return (
                      <ActionGroupForm
                        index={fieldIndex}
                        actionList={actionList}
                        onActionItemChange={onActionItemChange}
                        actionGroup={actions[fieldIndex]}
                        onRemove={() => {
                          remove(fieldIndex);
                          onGroupChange();
                        }}
                        ruleIsView={ruleIsView}
                      />
                    );
                  })}
                </>
              );
            }}
          </Form.List>
        </Form.Item>
      </Form>
    )
  }

  return (
    <>
      {!actionIsShow && actionRender()}
    </>
  )
}

export default connect(({ app }: ConnectState) => ({
  currentApp: app.currentApp,
}))(ActionForm);
