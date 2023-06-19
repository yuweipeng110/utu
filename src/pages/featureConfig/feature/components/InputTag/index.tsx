import React, { useState, useImperativeHandle, useRef, forwardRef, useEffect } from 'react';
import { Input, Tag, Tooltip } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import '../../index.less';

type InputTagType = {
  tagValue: any;
  setFeatureTagsList: any;
  checkNull: boolean;
  isView: boolean;
};

export default forwardRef((props: InputTagType, ref) => {
  const { tagValue,setFeatureTagsList, isView } = props;
  // const [value, setValue] = useState([]);
  const [valueInput, setValueInput] = useState('');
  const inputRef = useRef(null);
  useImperativeHandle(ref, () => ({
    changeVal: () => {
      return tagValue;
    },
  }));

  const pressEnter = (e: any) => {
    e.preventDefault();
    if ((inputRef.current as any).state.value) {
      setFeatureTagsList([...tagValue, (inputRef.current as any).state.value]);
      setValueInput('');
    }
  };

  const preventDefault = (str: string, e: any) => {
    e.preventDefault();
    setFeatureTagsList(tagValue.filter((item: string) => item !== str));
  };

  const focus = () => {
    if (inputRef.current) (inputRef.current as any).focus();
  };

  const handleChange = (e: any) => {
    const elm = e.target;
    setValueInput(elm.value);
  };

  // 按下删除监听
  const keyDown = (e: any) => {
    if (e.keyCode === 8 && !valueInput) {
      setFeatureTagsList(
        tagValue.filter((v: string, i: number, ar: any) => {
          return i !== ar.length - 1;
        }),
      );
    }
  };

  return (
    <>
      <div onClick={focus} className="wrap" style={{ background: isView ? '#F5F5F5' : '' }}>
        <div className="input-tag">
          <Tooltip title="添加特征分类" className="plus-li">
            <PlusOutlined onClick={pressEnter} />
          </Tooltip>
          <ul className="ul-class">
            {tagValue &&
              tagValue.map((item: string, index: number) => (
                <li key={index} style={{ float: 'left' }}>
                  <Tag closable={!isView} onClose={(e) => preventDefault(item, e)}>
                    {item}
                  </Tag>
                </li>
              ))}
            <li style={{ float: 'left' }}>
              <Input
                placeholder={tagValue.length === 0 && !isView ? '请输入' : ''}
                onKeyDown={keyDown}
                ref={inputRef}
                value={valueInput}
                className="input-class"
                onPressEnter={pressEnter}
                onChange={handleChange}
                disabled={isView}
              />
            </li>
          </ul>
        </div>
      </div>
    </>
  );
});
