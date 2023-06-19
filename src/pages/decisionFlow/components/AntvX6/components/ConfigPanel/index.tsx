import React, { useEffect, useState } from 'react';
import ConfigGrid from './ConfigGrid';
import ConfigNode from './ConfigNode';
import ConfigEdge from './ConfigEdge';
// import FlowGraph from '@/pages/X6/Graph';
import FlowGraph from '../../Graph';
// import { useGridAttr } from '@/models/global';
import styles from './index.less';

type ConfigPanelProps = {
  currentFlowData: any;
  setPackageList: any;
  packageList: any;
  packageLoading: boolean;
  packageRun: any;
  packageCancel: any;
  setFeatureList: any;
  featureList: any;
  featureLoading: boolean;
  featureRun: any;
  featureCancel: any;
};

export function useGridAttr() {
  const [gridAttrs, setGridAttrs] = useState({
    type: 'dot',
    size: 10,
    color: '#e5e5e5',
    thickness: 2,
    colorSecond: '#d0d0d0',
    thicknessSecond: 1,
    factor: 4,
    bgColor: 'transparent',
    showImage: true,
    repeat: 'watermark',
    angle: 30,
    position: 'center',
    bgSize: JSON.stringify({ width: 150, height: 150 }),
    opacity: 0,
  });
  const setGridAttr = (key: any, value: any) => {
    setGridAttrs((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  return {
    gridAttrs,
    setGridAttr,
  };
}

export default (props: ConfigPanelProps) => {
  const {
    currentFlowData,
    setPackageList,
    packageList,
    packageLoading,
    packageRun,
    packageCancel,
    setFeatureList,
    featureList,
    featureLoading,
    featureRun,
    featureCancel,
  } = props;
  const [type, setType] = useState('GRID'); // 默认为画布
  const [id, setId] = useState('');
  const { gridAttrs, setGridAttr } = useGridAttr();

  useEffect(() => {
    const { graph } = FlowGraph;
    graph.on('blank:click', () => {
      setType('GRID');
    });
    graph.on('cell:click', ({ cell }) => {
      setType(cell.isNode() ? 'NODE' : 'EDGE');
      setId(cell.id);
    });
  }, []);

  useEffect(() => {
    if (currentFlowData) {
      setType('GRID');
    }
  }, [currentFlowData]);

  return (
    <div className={styles.config}>
      {type === 'GRID' && <ConfigGrid attrs={gridAttrs} setAttr={setGridAttr} />}
      {type === 'NODE' && (
        <ConfigNode
          id={id}
          setPackageList={setPackageList}
          packageList={packageList}
          packageLoading={packageLoading}
          packageRun={packageRun}
          packageCancel={packageCancel}
          setFeatureList={setFeatureList}
          featureList={featureList}
          featureLoading={featureLoading}
          featureRun={featureRun}
          featureCancel={featureCancel}
        />
      )}
      {type === 'EDGE' && (
        <ConfigEdge
          id={id}
          setFeatureList={setFeatureList}
          featureList={featureList}
          featureLoading={featureLoading}
          featureRun={featureRun}
          featureCancel={featureCancel}
        />
      )}
    </div>
  );
};
