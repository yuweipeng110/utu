import ProForm, { ModalForm, ProFormDigit, ProFormSelect } from '@ant-design/pro-form';
import { Form, message } from 'antd';
import { OfflineStrategyObjIdType } from '@/consts/offlineStrategy/const';
import { offlineStrategyGetSample } from '@/services/offlineStrategy';
import moment from 'moment';

type SamplingProps = {
  actionRef: any;
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
};

const Sampling: React.FC<SamplingProps> = (props) => {
  const { actionRef, visible, onVisibleChange } = props;
  const [form] = Form.useForm();
  const onSubmit = async (values: any) => {
    const loadingKey = 'loadingKey';
    message.loading({ content: '正在下载...', key: loadingKey, duration: 0 });
    const res = await offlineStrategyGetSample({ ...values });
    if (res) {
      const time = `${moment().format('YYYY/MM/DD HH/mm/ss')}.xls`;
      const blob = res;
      const reader = new FileReader();
      if (res.type === 'application/json') {
        reader.readAsText(res, 'utf-8');
        reader.onload = () => {
          let res = JSON.parse(reader.result);
          if (res.code !== 1) {
            message.error({ content: res.message, key: loadingKey, duration: 2 });
            return false;
          }
        };
      } else {
        reader.readAsDataURL(blob);
        reader.onload = (e) => {
          const a = document.createElement('a');
          a.download = time;
          // 后端设置的文件名称在res.headers的 "content-disposition": "form-data; name=\"attachment\"; filename=\"20181211191944.zip\"",
          a.href = e.target.result;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        };
      }
    }
    message.success({ content: '下载成功!', key: loadingKey, duration: 2 });
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
      title="抽样"
      visible={visible}
      onVisibleChange={(visibleValue) => {
        form.resetFields();
        onVisibleChange(visibleValue);
      }}
      form={form}
      onFinish={onFinish}
    >
      <ProForm.Group>
        <ProFormSelect
          name="objId"
          label="实体ID"
          width="md"
          options={Object.keys(OfflineStrategyObjIdType).map((key) => {
            return {
              value: key.toString(),
              label: OfflineStrategyObjIdType[key],
            };
          })}
          rules={[
            {
              required: true,
            },
          ]}
        />
        <ProFormDigit
          name="number"
          label="样本条数"
          width="md"
          rules={[
            {
              required: true,
            },
          ]}
          min={100}
          max={1000}
          initialValue={100}
        />
      </ProForm.Group>
    </ModalForm>
  );
};

export default Sampling;
