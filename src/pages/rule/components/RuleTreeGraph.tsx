import React, { useEffect, useState } from 'react';
import { history } from 'umi';
import G6 from '@antv/g6';
import insertCss from 'insert-css';
import { CalleArr } from '@/utils/ruleTreeGraph';
import { getPageQuery } from "@/utils/utils";
import { queryRuleBranchTree } from "@/services/rule";

// 我们用 insert-css 演示引入自定义样式
// 推荐将样式添加到自己的样式文件中
// 若拷贝官方代码，别忘了 npm install insert-css
// @ts-ignore
insertCss(`
  .g6-component-tooltip {
    background-color: rgba(0,0,0, 0.65);
    padding: 10px;
    box-shadow: rgb(174, 174, 174) 0px 0px 10px;
    width: fit-content;
    color: #fff;
    border-radius = 4px;
  }
`);

const dataPrefix = {
  branchTypePrefix: '分支类型：',
  branchStatusPrefix: '当前阶段：',
  publishStatePrefix: '发布状态：',
  runTypePrefix: '运行模式：',
  branchPriorityPrefix: '执行顺序：',
  branchDescriptionPrefix: '描述：',
};

const colors = {
  B: '#5B8FF9',
  R: '#F46649',
  Y: '#EEBC20',
  G: '#5BD8A6',
  DI: '#A7A7A7',
  C: '#C2CC37',
};

//  组件props
const props = {
  // data: mockData,
  config: {
    padding: [20, 50],
    defaultLevel: 3,
    defaultZoom: 0.8,
    modes: { default: ['zoom-canvas', 'drag-canvas'] },
  },
};


// 默认配置
const defaultConfig = {
  width: document.body.clientWidth - 100,
  height: document.body.clientHeight - 300,
  modes: {
    default: ['zoom-canvas', 'drag-canvas'],
  },
  fitView: true,
  animate: true,
  defaultNode: {
    type: 'flow-rect',
  },
  defaultEdge: {
    type: 'cubic-horizontal',
    style: {
      stroke: '#CED4D9',
    },
  },
  layout: {
    type: 'indented',
    direction: 'LR',
    dropCap: false,
    indent: 300,
    getHeight: () => {
      return 120;
    },
  },
};

// 自定义节点、边
const registerFn = () => {
  /**
   * 自定义节点
   */
  G6.registerNode(
    'flow-rect',
    {
      shapeType: 'flow-rect',
      draw(cfg, group) {
        const {
          name = '',
          branchType,
          branchStatus,
          publishState,
          runType,
          branchPriority,
          branchDescription = '',
          // variableName,
          // variableValue,
          variableUp,
          // label,
          collapsed,
          // currency,
          status,
          rate,
        } = cfg;
        const grey = '#CED4D9';
        // 逻辑不应该在这里判断
        const rectConfig = {
          width: 200,
          height: 140,
          lineWidth: 1,
          fontSize: 12,
          fill: '#fff',
          radius: 2,
          stroke: grey,
          opacity: 1,
        };

        const nodeOrigin = {
          x: -rectConfig.width / 2,
          y: -rectConfig.height / 2,
        };

        const textConfig = {
          textAlign: 'left',
          textBaseline: 'bottom',
        };

        const rect = group!.addShape('rect', {
          attrs: {
            x: nodeOrigin.x,
            y: nodeOrigin.y,
            ...rectConfig,
          },
        });

        const rectBBox = rect.getBBox();

        // label title
        const nameShape = group!.addShape('text', {
          attrs: {
            ...textConfig,
            x: 12 + nodeOrigin.x,
            y: 20 + nodeOrigin.y,
            text: name.length > 28 ? `${name.substr(0, 28)}...` : name,
            fontSize: 12,
            opacity: 0.85,
            // fill: '#000',
            fill: colors[status],
            cursor: 'pointer',
          },
          name: 'name-shape',
        });

        // branchType
        const branchTypeShape = group!.addShape('text', {
          attrs: {
            ...textConfig,
            x: nameShape.getBBox().x,
            y: nameShape.getBBox().y + 30,
            text: dataPrefix.branchTypePrefix + branchType,
            fontSize: 12,
            fill: '#000',
            opacity: 0.75,
          },
        });

        // branchStatus
        const branchStatusShape = group!.addShape('text', {
          attrs: {
            ...textConfig,
            x: branchTypeShape.getBBox().x,
            y: branchTypeShape.getBBox().y + 30,
            text: dataPrefix.branchStatusPrefix + branchStatus,
            fontSize: 12,
            fill: '#000',
            opacity: 0.75,
          },
        });

        // publishState
        const publishStateShape = group!.addShape('text', {
          attrs: {
            ...textConfig,
            x: branchStatusShape.getBBox().x,
            y: branchStatusShape.getBBox().y + 30,
            text: dataPrefix.publishStatePrefix + publishState,
            fontSize: 12,
            fill: '#000',
            opacity: 0.75,
          },
        });

        // runType
        const runTypeShape = group!.addShape('text', {
          attrs: {
            ...textConfig,
            x: publishStateShape.getBBox().x,
            y: publishStateShape.getBBox().y + 30,
            text: dataPrefix.runTypePrefix + runType,
            fontSize: 12,
            fill: '#000',
            opacity: 0.75,
          },
        });

        // branchPriority
        const branchPriorityShape = group!.addShape('text', {
          attrs: {
            ...textConfig,
            x: runTypeShape.getBBox().x,
            y: runTypeShape.getBBox().y + 30,
            text: dataPrefix.branchPriorityPrefix + branchPriority,
            fontSize: 12,
            fill: '#000',
            opacity: 0.75,
          },
        });

        // branchDescription
        group!.addShape('text', {
          attrs: {
            ...textConfig,
            x: branchPriorityShape.getBBox().x,
            y: branchPriorityShape.getBBox().y + 30,
            text: branchDescription.length > 16 ? `${dataPrefix.branchDescriptionPrefix + branchDescription.substr(0, 16)}...` : dataPrefix.branchDescriptionPrefix + branchDescription,
            fontSize: 12,
            opacity: 0.85,
            fill: '#000',
            cursor: 'pointer',
          },
          name: 'branchDescription-shape',
        });

        // // price
        // const price = group.addShape('text', {
        //   attrs: {
        //     ...textConfig,
        //     x: 12 + nodeOrigin.x,
        //     y: rectBBox.maxY - 12,
        //     text: label,
        //     fontSize: 12,
        //     fill: '#000',
        //     opacity: 0.85,
        //   },
        // });

        // // label currency
        // group.addShape('text', {
        //   attrs: {
        //     ...textConfig,
        //     x: price.getBBox().maxX + 5,
        //     y: rectBBox.maxY - 12,
        //     text: currency,
        //     fontSize: 12,
        //     fill: '#000',
        //     opacity: 0.75,
        //   },
        // });

        // // percentage
        // const percentText = group.addShape('text', {
        //   attrs: {
        //     ...textConfig,
        //     x: rectBBox.maxX - 8,
        //     y: rectBBox.maxY - 12,
        //     // text: `${((variableValue || 0) * 100).toFixed(2)}%`,
        //     text: variableValue,
        //     fontSize: 12,
        //     textAlign: 'right',
        //     fill: colors[status],
        //   },
        // });

        // percentage triangle
        const symbol = variableUp ? 'triangle' : 'triangle-down';
        const triangle = group!.addShape('marker', {
          attrs: {
            ...textConfig,
            // x: 12 + nodeOrigin.x,
            // x: percentText.getBBox().minX - 10,
            x: rectBBox.maxX - 18,
            y: 18 + nodeOrigin.y,
            // y: rectBBox.maxY - 12 - 6,
            symbol,
            r: 6,
            fill: colors[status],
          },
        });

        // // variable name
        // group.addShape('text', {
        //   attrs: {
        //     ...textConfig,
        //     x: triangle.getBBox().minX - 4,
        //     y: rectBBox.maxY - 12,
        //     text: variableName,
        //     fontSize: 12,
        //     textAlign: 'right',
        //     fill: '#000',
        //     opacity: 0.45,
        //   },
        // });

        // bottom line background
        const bottomBackRect = group!.addShape('rect', {
          attrs: {
            x: nodeOrigin.x,
            y: rectBBox.maxY - 4,
            width: rectConfig.width,
            height: 4,
            radius: [0, 0, rectConfig.radius, rectConfig.radius],
            fill: '#E0DFE3',
          },
        });

        // bottom percent
        const bottomRect = group!.addShape('rect', {
          attrs: {
            x: nodeOrigin.x,
            y: rectBBox.maxY - 4,
            width: rate * rectBBox.width,
            height: 4,
            radius: [0, 0, 0, rectConfig.radius],
            fill: colors[status],
          },
        });

        // collapse rect
        if (cfg!.children && cfg.children.length) {
          group!.addShape('rect', {
            attrs: {
              x: rectConfig.width / 2 - 8,
              y: -8,
              width: 16,
              height: 16,
              stroke: 'rgba(0, 0, 0, 0.25)',
              cursor: 'pointer',
              fill: '#fff',
            },
            name: 'collapse-back',
            modelId: cfg!.id,
          });

          // collpase text
          group!.addShape('text', {
            attrs: {
              x: rectConfig.width / 2,
              y: -1,
              textAlign: 'center',
              textBaseline: 'middle',
              text: collapsed ? '+' : '-',
              fontSize: 16,
              cursor: 'pointer',
              fill: 'rgba(0, 0, 0, 0.25)',
            },
            name: 'collapse-text',
            modelId: cfg!.id,
          });

        }

        this.drawLinkPoints(cfg, group);
        return rect;
      },
      update(cfg, item) {
        const group = item.getContainer();
        this.updateLinkPoints(cfg, group);
      },
      setState(name, value, item) {
        if (name === 'collapse') {
          const group = item!.getContainer();
          const collapseText = group.find((e) => e.get('name') === 'collapse-text');
          if (collapseText) {
            if (!value) {
              collapseText.attr({
                text: '-',
              });
            } else {
              collapseText.attr({
                text: '+',
              });
            }
          }
        }
      },
      getAnchorPoints() {
        return [
          [0, 0.5],
          [1, 0.5],
        ];
      },
    },
    'rect',
  );

  G6.registerEdge(
    'flow-cubic',
    {
      getControlPoints(cfg) {
        let { controlPoints } = cfg; // 指定controlPoints
        if (!controlPoints || !controlPoints.length) {
          const { startPoint, endPoint, sourceNode, targetNode } = cfg;
          const { x: startX, y: startY, coefficientX, coefficientY } = sourceNode
            ? sourceNode.getModel()
            : startPoint;
          const { x: endX, y: endY } = targetNode ? targetNode.getModel() : endPoint;
          let curveStart = (endX - startX) * coefficientX;
          let curveEnd = (endY - startY) * coefficientY;
          curveStart = curveStart > 40 ? 40 : curveStart;
          curveEnd = curveEnd < -30 ? curveEnd : -30;
          controlPoints = [
            { x: startPoint!.x + curveStart, y: startPoint!.y },
            { x: endPoint!.x + curveEnd, y: endPoint!.y },
          ];
        }
        return controlPoints;
      },
      getPath(points: any) {
        const path = [];
        path.push(['M', points[0].x, points[0].y]);
        path.push([
          'C',
          points[1].x,
          points[1].y,
          points[2].x,
          points[2].y,
          points[3].x,
          points[3].y,
        ]);
        return path;
      },
    },
    'single-line',
  );
};

registerFn();

/**
 * 鼠标右键点击事件
 */
const contextMenu = new G6.Menu({
  getContent() {
    return `<h4>展开父级</h4><h4>展开子集</h4>`;
  },
  handleMenuClick: (target: any, item: any) => {
    console.log(target, item);
  },
  // offsetX and offsetY include the padding of the parent container
  // 需要加上父级容器的 padding-left 16 与自身偏移量 10
  offsetX: 16 + 10,
  // 需要加上父级容器的 padding-top 24 、画布兄弟元素高度、与自身偏移量 10
  offsetY: 0,
  // the types of items that allow the menu show up
  // 在哪些类型的元素上响应
  itemTypes: ['node'],
});

const tooltip = new G6.Tooltip({
  // offsetX and offsetY include the padding of the parent container
  offsetX: 20,
  offsetY: 30,
  // the types of items that allow the tooltip show up
  // 允许出现 tooltip 的 item 类型
  itemTypes: ['node'],
  // custom the tooltip's content
  // 自定义 tooltip 内容
  getContent: (e: any) => {
    const outDiv = document.createElement('div');
    outDiv.style.padding = '0px 0px 20px 0px';
    const nodeName = e.item.getModel().branchDescription;
    if (nodeName) {
      let formatedNodeName = '';
      for (let i = 0; i < nodeName.length; i += 1) {
        formatedNodeName = `${formatedNodeName}${nodeName[i]}`;
        if (i !== 0 && i % 20 === 0) formatedNodeName = `${formatedNodeName}<br/>`;
      }
      outDiv.innerHTML = `${formatedNodeName}`;
    }
    return outDiv;
  },
  shouldBegin: (e: any) => {
    // if (e.target.get('name') === 'name-shape') return true;
    if (e.target.get('name') === 'branchDescription-shape') return true;
    return false;
  },
});

export default () => {
  const ref = React.useRef(null);

  // const [data, setData] = useState();

  // const queryParams = getPageQuery();
  // const appId = queryParams['app_id'];
  // const sceneId = queryParams['scene_id'];

  useEffect(() => {
    // setData(queryRuleBranchTree({
    //   appId,
    //   sceneId
    // }));
  },[]);


  const data = {
    id: 1,
    name: 'Master',
    branchType: 0,
    branchStatus: 400,
    publishState: 4,
    runType: 0,
    branchPriority: '999',
    branchDescription: '0205_test_0这是基线分支的描述内容',
    children: [
      {
        id: 2,
        name: 'FeatureA',
        branchType: 1,
        branchStatus: 400,
        publishState: 4,
        runType: 0,
        branchPriority: '1',
        branchDescription: '0205_test_01',
        children: [
          {
            id: 5,
            name: 'Feature_A_1',
            branchType: 1,
            branchStatus: 400,
            publishState: 4,
            runType: 0,
            branchPriority: '1',
            branchDescription: '0205_test_01',
          },
          {
            id: 6,
            name: 'Feature_A_2',
            branchType: 1,
            branchStatus: 400,
            publishState: 4,
            runType: 0,
            branchPriority: '1',
            branchDescription: '0205_test_01',
          },
        ],
      },
      {
        id: 3,
        name: 'FeatureB',
        rate: 1,
        // status: 'Y',
        branchType: 1,
        branchStatus: 400,
        publishState: 4,
        runType: 0,
        branchPriority: '1',
        branchDescription: '0205_test_01',
      },
      {
        id: 4,
        name: 'FeatureC',
        branchType: 1,
        branchStatus: 400,
        publishState: 4,
        runType: 0,
        branchPriority: '1',
        branchDescription: '0205_test_01',
      },
    ],
  };

  const { config } = props;
  let graph: any = null;

  useEffect(() => {
    console.log('data', data);

    CalleArr([data]);
    if (!data) {
      return;
    }
    graph = new G6.TreeGraph({
      container: ref.current,
      ...defaultConfig,
      ...config,
      plugins: [tooltip, contextMenu],
    });

    graph.on('name-shape:click', (evt: any) => {
      // evt.item._cfg
      // console.log('evt', evt);
      // console.log('id', graph.findById(evt.item.getModel().id));
      const appId = 1;
      const sceneId = 1;
      const branchId = evt.item.getModel().id;
      history.push(`/scene/rule/update?id=${branchId}&app_id=${appId}&scene_id=${sceneId}`);
    });
    graph.data(data);
    graph.render();
    graph.zoom(config.defaultZoom || 1);

    const handleCollapse = (e: any) => {
      const { target } = e;
      const id = target.get('modelId');
      const item = graph.findById(id);
      const nodeModel = item.getModel();
      nodeModel.collapsed = !nodeModel.collapsed;
      graph.layout();
      graph.setItemState(item, 'collapse', nodeModel.collapsed);
    };
    graph.on('collapse-text:click', (e: any) => {
      handleCollapse(e);
    });
    graph.on('collapse-back:click', (e: any) => {
      handleCollapse(e);
    });
  }, []);

  return (
    <div ref={ref}></div>
  );
}

