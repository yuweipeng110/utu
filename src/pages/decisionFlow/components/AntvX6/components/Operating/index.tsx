import { Tooltip } from 'antd';
import { useState } from 'react';

type OperatingProps = {
  FlowGraph: any;
};
export default (props: OperatingProps) => {
  const { FlowGraph } = props;

  const [edgeArrow, setEdgeArrow] = useState<number>(3);

  const setCurrentArrow = (currentEdgeArrow: number) =>
    edgeArrow === currentEdgeArrow ? 'currentArrow' : '';

  const changeEdgeType = (e: string = '') => {
    if (e === 'normal') {
      FlowGraph.SetConnectEdgeType({
        connector: 'normal',
        router: { name: '' },
      });
      setEdgeArrow(1);
    } else if (e === 'smooth') {
      FlowGraph.SetConnectEdgeType({
        connector: 'smooth',
        router: { name: 'manhattan' },
      });
      setEdgeArrow(2);
    } else {
      FlowGraph.SetConnectEdgeType({
        connector: 'rounded',
        router: { name: 'manhattan' },
      });
      setEdgeArrow(3);
    }
  };

  return (
    <div className="operating">
      <div className="btn-group">
        <Tooltip title="直线箭头" placement="bottom">
          <div
            // className="btn"
            className={'btn ' + setCurrentArrow(1)}
            onClick={() => {
              changeEdgeType('normal');
            }}
          >
            <i className="iconfont icon-ai28"></i>
          </div>
        </Tooltip>
        <Tooltip title="曲线箭头" placement="bottom">
          <div
            // className="btn currentArrow"
            className={'btn ' + setCurrentArrow(2)}
            onClick={() => {
              changeEdgeType('smooth');
            }}
          >
            <i className="iconfont icon-Down-Right"></i>
          </div>
        </Tooltip>
        <Tooltip title="直角箭头" placement="bottom">
          <div
            // className="btn"
            className={'btn ' + setCurrentArrow(3)}
            onClick={() => {
              changeEdgeType();
            }}
          >
            <i className="iconfont icon-jiantou"></i>
          </div>
        </Tooltip>
      </div>
    </div>
  );
};
