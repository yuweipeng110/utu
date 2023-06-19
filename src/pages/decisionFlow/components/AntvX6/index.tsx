import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useRequest } from 'umi';
import { message } from 'antd';
import type { Graph } from '@antv/x6';
import { FlowInfo } from '@/models/flow';
import { getAllPackage } from '@/services/package';
import { getFeatureListByLike } from '@/services/featureConfig';
import FlowGraph from './Graph';
import ToolBar from './components/ToolBar';
import ConfigPanel from './components/ConfigPanel';
import Operating from './components/Operating';
import { getPageQuery } from '@/utils/utils';
import { initJsonData } from './Graph/data';
import _ from 'lodash';
import './global.less';
import './index.less';
import './iconfont.less';

type AntvX6Props = {
  currentFlowData?: FlowInfo;
  isDisabled: boolean;
  diffDataOld?: string;
  diffDataNew?: string;
};

export default forwardRef((props: AntvX6Props, ref) => {
  const { currentFlowData, isDisabled = false, diffDataOld, diffDataNew } = props;
  const queryParams = getPageQuery();
  const appId = queryParams['app_id'];
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stenciRef = useRef<HTMLDivElement | null>(null);
  const graphRef = useRef<Graph>();

  const [isReady, setIsReady] = useState(false);
  const [packageList, setPackageList] = useState([]);
  const [featureList, setFeatureList] = useState([]);

  useImperativeHandle(ref, () => ({
    // 暴露给父组件的方法
    instance: graphRef.current,
    FlowGraph: FlowGraph,
  }));

  /**
   * 查询包
   */
  const {
    loading: packageLoading,
    run: packageRun,
    cancel: packageCancel,
  } = useRequest(getAllPackage, {
    debounceInterval: 500,
    manual: true,
    formatResult: (res) => {
      setPackageList(res);
    },
  });

  /**
   * 查询特征
   */
  const {
    loading: featureLoading,
    run: featureRun,
    cancel: featureCancel,
  } = useRequest(getFeatureListByLike, {
    debounceInterval: 500,
    manual: true,
    formatResult: (res) => {
      setFeatureList(res.data);
    },
  });

  const getContainerSize = () => {
    return {
      width: document.body.offsetWidth,
      height: document.body.offsetHeight,
    };
  };

  const initGraph = () => {
    let graph: Graph;
    // setIsReady(false);
    // FlowGraph.graphDispose();

    try {
      if (!_.isEmpty(diffDataOld) && !_.isEmpty(diffDataNew)) {
        FlowGraph.SetDiffJsonDataOld(JSON.parse(diffDataOld as string));
        FlowGraph.SetDiffJsonDataNew(JSON.parse(diffDataNew as string));
        graph = FlowGraph.init(containerRef.current!, stenciRef.current!);
      } else if (!_.isEmpty(currentFlowData) && !_.isEmpty(currentFlowData?.content)) {
        FlowGraph.SetInitJsonData(JSON.parse(currentFlowData?.content as string));
        FlowGraph.SetLightJsonData(currentFlowData?.flowLightData);
        graph = FlowGraph.init(containerRef.current!, stenciRef.current!);
      } else {
        FlowGraph.SetInitJsonData(initJsonData);
        graph = FlowGraph.init(containerRef.current!, stenciRef.current!);
      }
    } catch (e: any) {
      message.error(e.toString());
      return;
    }
    setIsReady(true);

    const resizeFn = () => {
      const { width, height } = getContainerSize();
      graph.resize(width, height);
    };
    resizeFn();

    graphRef.current = graph;

    window.addEventListener('resize', resizeFn);
    return () => {
      window.removeEventListener('resize', resizeFn);
    };
  };

  // 处理dag画布是否渲染
  useEffect(() => {
    if (!_.isEmpty(graphRef.current)) {
      if (!FlowGraph.isGraphReady() || containerRef.current?.querySelector('svg') === null) {
        message.error('初始化dag遇到未知错误，请重试');
      }
    }
  }, [graphRef.current]);

  useEffect(() => {
    if (!_.isEmpty(currentFlowData) && !isReady) {
      // console.log('effect currentFlowData', currentFlowData);
      // 加载决策流数据 并 初始化DAG图形
      initGraph();
    }
  }, [currentFlowData, isReady]);

  useEffect(() => {
    if (!_.isEmpty(diffDataOld) && !_.isEmpty(diffDataNew) && !isReady) {
      // 加载决策流数据 并 初始化DAG图形
      initGraph();
    }
  }, [diffDataOld, diffDataNew, isReady]);

  useEffect(() => {
    packageRun({
      appId: Number(appId),
      // isInit: true,
    });
    featureRun({
      appId: Number(appId),
    });
    return () => {
      FlowGraph.graphDispose();
    };
  }, []);

  return (
    <>
      <div
        className="wrap"
        id="wrapper"
        ref={(elem) => {
          wrapperRef.current = elem;
        }}
      >
        {/* <div className="header">
          <span className="text">
          </span>
          <span>
          </span>
        </div> */}
        {!isDisabled && <div className="toolbar">{isReady && <ToolBar />}</div>}
        <div className="content">
          <div id="stencil" ref={stenciRef} className={isDisabled ? 'shapes_none' : 'shapes'}></div>
          {/* 图容器 */}
          <div id="container" className="x6-graph" ref={containerRef} />
          {/* 操作容器 */}
          <Operating FlowGraph={FlowGraph} />
          {/* 小地图 */}
          {/* <div id="minimap" className="minimap"></div> */}
          <div className="config">
            {isReady && (
              <ConfigPanel
                currentFlowData={currentFlowData}
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
          </div>
        </div>
      </div>
    </>
  );
});
