import React, { useEffect } from 'react';
import ProCard from '@ant-design/pro-card';
import { ProFormSelect } from '@ant-design/pro-form';
import FlowGraph from '../../../Graph';
import '../../../index.less';

const GridType = {
  dot: 'Dot',
  fixedDot: 'Fixed Dot',
  mesh: 'Mesh',
  doubleMesh: 'Double Mesh',
};

export default (props: { attrs: any; setAttr: any }) => {
  const { attrs, setAttr } = props;

  useEffect(() => {
    let options;
    if (attrs.type === 'doubleMesh') {
      options = {
        type: attrs.type,
        args: [
          {
            color: attrs.color,
            thickness: attrs.thickness,
          },
          {
            color: attrs.colorSecond,
            thickness: attrs.thicknessSecond,
            factor: attrs.factor,
          },
        ],
      };
    } else {
      options = {
        type: attrs.type,
        args: [
          {
            color: attrs.color,
            thickness: attrs.thickness,
          },
        ],
      };
    }
    const { graph } = FlowGraph;
    graph.drawGrid(options);
  }, [
    attrs.type,
    attrs.color,
    attrs.thickness,
    attrs.thicknessSecond,
    attrs.colorSecond,
    attrs.factor,
  ]);

  useEffect(() => {
    const { graph } = FlowGraph;
    graph.setGridSize(attrs.size);
  }, [attrs.size]);

  return (
    <ProCard title="网格样式" headerBordered size="small" className="my-flow-pro-card">
      <ProFormSelect
        label="网格类型"
        fieldProps={{ size: 'small', onChange: (val) => setAttr('type', val), value: attrs.type }}
        options={Object.keys(GridType).map((key) => {
          return {
            value: key,
            label: GridType[key],
          };
        })}
      />
    </ProCard>
  );
};
