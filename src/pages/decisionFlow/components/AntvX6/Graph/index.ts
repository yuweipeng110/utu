import { Graph, Addon, FunctionExt, Shape } from '@antv/x6';
import type { Cell, Model, Edge } from '@antv/x6';
import './shape';
import { ports } from './shape';

export default class FlowGraph {
  public static graph: Graph;
  private static stencil: Addon.Stencil;
  private static interval: NodeJS.Timer;
  private static containerRef?: HTMLElement;
  private static stenciRef?: HTMLElement;

  private static initJsonData: any;
  private static lightJsonData: string[] = [];
  private static diffJsonDataOld: any;
  private static diffJsonDataNew: any;
  // 连线方式 默认圆角连接器
  private static connectEdgeType: any = {
    connector: 'rounded',
    router: {
      name: 'manhattan',
    },
  };

  public static SetInitJsonData(initJsonData: any) {
    this.initJsonData = initJsonData;
  }

  public static SetLightJsonData(lightJsonData: any) {
    this.lightJsonData = lightJsonData;
  }

  public static SetDiffJsonDataOld(diffJsonDataOld: any) {
    this.diffJsonDataOld = diffJsonDataOld;
  }

  public static SetDiffJsonDataNew(diffJsonDataNew: any) {
    this.diffJsonDataNew = diffJsonDataNew;
  }

  public static SetConnectEdgeType(connectEdgeType: any) {
    this.connectEdgeType = connectEdgeType;
  }

  public static clearData() {
    this.initJsonData = null;
    this.lightJsonData = [];
    this.diffJsonDataOld = null;
    this.diffJsonDataNew = null;
  }

  public static init(
    containerRef: HTMLElement,
    stenciRef: HTMLElement,
    // type: number,
    // initJsonData: any,
    // lightJsonData: string[] = [],
  ) {
    // this.clearData();
    // let initJsonData;

    // if (this.graph !== undefined) {
    // this.graphDispose();
    //   // this.graph.clearCells();
    //   // this.graph.clearGrid();
    //   // this.graph.dispose();
    // }
    this.containerRef = containerRef;
    this.stenciRef = stenciRef;

    this.graph = new Graph({
      container: this.containerRef,
      width: 1000,
      height: 800,
      grid: {
        size: 10,
        visible: true,
        type: 'doubleMesh',
        args: [
          {
            color: '#cccccc',
            thickness: 1,
          },
          {
            color: '#5F95FF',
            thickness: 1,
            factor: 4,
          },
        ],
      },
      scroller: {
        enabled: true,
        pannable: true,
        pageVisible: false, // 是否分页
        pageBreak: false,
      },
      mousewheel: {
        enabled: true,
        modifiers: ['ctrl', 'meta'],
      },
      // selecting: {
      //   enabled: true,
      //   showNodeSelectionBox: true,
      // },
      // panning: {
      //   enabled: true,
      //   eventTypes: ['leftMouseDown', 'rightMouseDown', 'mouseWheel'],
      //   modifiers: 'ctrl',
      // },
      // resizing: true, // 缩放节点
      // rotating: true, // 旋转节点
      selecting: {
        enabled: true,
        // rubberband: true,
        showNodeSelectionBox: true,
      },
      connecting: {
        anchor: 'center',
        connectionPoint: 'anchor',
        connector: 'rounded',
        createEdge() {
          // 线/边的初始化属性设置 默认data type = 3(实线)
          return new Shape.Edge({
            baseData: {
              name: '边',
              englishName: '',
              desc: '',
            },
            data: {
              type: 3,
              isReadOnly: false,
              pointtoRelation: 2,
            },
            labels: [
              {
                attrs: { text: { text: '边' } },
              },
            ],
            connector: FlowGraph.connectEdgeType.connector,
            router: {
              name: FlowGraph.connectEdgeType.router.name || '',
            },
            attrs: {
              line: {
                // strokeDasharray: '5 5',
                stroke: '#5F95FF',
                // stroke: '#A2B1C3',
                strokeWidth: 2,
                sourceMarker: {
                  name: 'diamond',
                  args: {
                    size: 6,
                  },
                },
                targetMarker: {
                  name: 'classic',
                  args: {
                    size: 14,
                  },
                },
                zIndex: 0,
              },
            },
          });
        },
        router: 'manhattan',
        allowBlank: false,
        highlight: true,
        snap: true,
        validateConnection({ sourceView, targetView, sourceMagnet, targetMagnet }) {
          if (sourceView === targetView) {
            return false;
          }
          if (!sourceMagnet) {
            return false;
          }
          if (!targetMagnet) {
            return false;
          }
          return true;
        },
      },
      highlighting: {
        magnetAvailable: {
          name: 'stroke',
          args: {
            attrs: {
              fill: '#fff',
              stroke: '#47C769',
            },
          },
        },
      },
      snapline: true,
      history: true,
      // minimap: {
      //   enabled: true,
      //   container: document.getElementById('minimap')!,
      //   width: 198,
      //   height: 198,
      //   padding: 10,
      // },
      clipboard: {
        enabled: true,
      },
      keyboard: {
        enabled: true,
      },
    });
    // console.log('this.initJsonData', this.initJsonData);

    if (this.diffJsonDataOld !== null && this.diffJsonDataNew) {
      this.SetInitJsonData(this.handleDiffJsonData());
    }

    this.initStencil();
    this.initShape();
    this.initGraphShape(this.initJsonData); // 填充数据
    this.initEvent();
    this.handleReadOnlyData(this.initJsonData, true);
    this.handleLightData(this.lightJsonData);
    return this.graph;
  }

  // 判断画布是否准备完成（主要用于 react 组件中）
  public static isGraphReady() {
    return !!this.graph;
  }

  private static initStencil() {
    this.stencil = new Addon.Stencil({
      target: this.graph,
      stencilGraphWidth: 200,
      validateNode: (node) => {
        const nName = node.getAttrByPath('text/textWrap/text');
        if (nName === '开 始') {
          node.setProp('id', 'start');
        }
        if (nName === '结 束') {
          node.setProp('id', 'end');
        }
        return true;
      },
      // search: { rect: true },
      // collapsable: true,
      groups: [
        {
          name: 'basic',
          title: '基础节点',
          // graphHeight: 180,
          layoutOptions: {
            columns: 1,
            marginX: 40,
            rowHeight: 90,
            // resizeToFit: true,
          },
          graphHeight: 300,
        },
      ],
    });
    const stencilContainer = this.stenciRef; //document.querySelector('#stencil');
    stencilContainer?.appendChild(this.stencil.container);
  }

  private static initShape() {
    const { graph } = this;
    const r2 = graph.createNode({
      baseData: {
        name: '策略节点',
        englishName: '',
        desc: '',
      },
      data: {
        type: 6,
        isReadOnly: false,
      },
      width: 110,
      height: 35,
      shape: 'custom-rect',
      attrs: {
        text: {
          textWrap: {
            text: '策略节点',
          },
        },
      },
    });
    const r3 = graph.createNode({
      baseData: {
        name: '实验节点',
        englishName: '',
        desc: '',
      },
      data: {
        type: 5,
        isReadOnly: false,
        diversionTypeParam: {
          diversionType: 1,
          defineTypeBottomStrategy: 1,
        },
      },
      width: 85,
      height: 85,
      shape: 'custom-polygon',
      // angle: 45,
      attrs: {
        body: {
          // fill: '#EFF4FF',
          // stroke: '#93B8FD',
          refPoints: '0,10 10,0 20,10 10,20',
        },
        text: {
          textWrap: {
            text: '实验节点',
          },
          // transform: 'rotate(-45deg)',
        },
      },
      ports: { ...ports },
    });
    const r5 = graph.createNode({
      baseData: {
        name: '选择节点',
        englishName: '',
        desc: '',
      },
      data: {
        type: 7,
        isReadOnly: false,
      },
      shape: 'custom-polygon',
      width: 75,
      height: 75,
      attrs: {
        body: {
          // fill: '#EFF4FF',
          // stroke: '#93B8FD',
          refPoints: '10,0 0,10 20,10',
          // refPoints: '0,75 75,75 37.5,0',
        },
        text: {
          refY: 0.65,
          textWrap: {
            text: '选择节点',
          },
        },
      },
      ports: {
        ...ports,
        items: [
          {
            group: 'top',
          },
          {
            group: 'bottom',
          },
        ],
      },
    });

    this.stencil.load([r2, r3], 'basic');
    // this.stencil.load([r1, r2, r3]);
  }

  public static initGraphShape(initJsonData: Model.FromJSONData) {
    // console.log('initJsonData', initJsonData);

    // this.graph.fromJSON(graphData);
    this.graph.fromJSON(initJsonData);
    // this.lightGraph.fromJSON(lightJsonData);
  }

  private static showPorts(ports: any, show: boolean) {
    for (let i = 0, len = ports.length; i < len; i += 1) {
      ports[i].style.visibility = show ? 'visible' : 'hidden';
    }
  }

  private static initEvent() {
    const { graph } = this;
    // const container = document.getElementById('container');

    graph.on(
      'node:mouseenter',
      FunctionExt.debounce(() => {
        const ports = this.containerRef?.querySelectorAll(
          '.x6-port-body',
        ) as NodeListOf<SVGElement>;
        this.showPorts(ports, true);
      }),
      500,
    );
    graph.on('node:mouseleave', () => {
      const ports = this.containerRef?.querySelectorAll('.x6-port-body') as NodeListOf<SVGElement>;
      this.showPorts(ports, false);
    });

    // 节点选中事件
    graph.on('selection:changed', (args) => {
      // const { removed, selected } = args
      // setCellsSelectedStatus(removed, false)
      // setCellsSelectedStatus(selected, true)
      // this.selectNodeSub = fromEventPattern<{ removed: N[]; selected: N[] }>(
      //   (handler) => {
      //     graph.on('selection:changed', handler)
      //   },
      //   (handler) => {
      //     graph.off('selection:changed', handler)
      //   },
      // ).subscribe((args) => {
      //   const { removed, selected } = args
      //   setCellsSelectedStatus(removed, false)
      //   setCellsSelectedStatus(selected, true)
      //   this.onSelectNodes(selected)
      // })
      // args.added.forEach((cell) => {
      //   // graph.selectCell = cell
      //   if (cell.isEdge()) {
      //     cell.addTools([
      //       {
      //         name: 'vertices',
      //         args: {
      //           padding: 4,
      //           attrs: {
      //             strokeWidth: 0.1,
      //             stroke: '#2d8cf0',
      //             fill: '#ffffff',
      //           },
      //         },
      //       },
      //     ]);
      //   }
      // });
      // args.removed.forEach((cell) => {
      //   // cell.isEdge() && cell.attr('line/strokeDasharray', 0); //正常线
      //   cell.removeTools();
      // });
    });

    // 清除路径动画和边动画
    const clearAnimate = () => {
      clearInterval(this.interval); // 清除定时器

      const edges = graph.getEdges();
      // edges.forEach((edge) => {
      //   edge.attr('line/strokeDasharray', '');
      //   edge.attr('line/style', {});
      // });
    };

    // 清除节点选中样式和边的样式
    const clearStyle = () => {
      const nodes = graph.getNodes();
      nodes.forEach((node) => {
        node.setAttrs({
          body: {
            filter: '',
          },
        });
      });

      const edges = graph.getEdges();
      edges.forEach((edge) => {
        edge.attr('line/stroke', '#5F95FF');
        edge.attr('line/strokeWidth', 2);
      });
    };

    // 点击画布时，清除连接桩
    graph.on('blank:click', () => {
      const ports = this.containerRef?.querySelectorAll('.x6-port-body');
      this.showPorts(ports, false);
      clearAnimate();
      // clearStyle();
    });

    graph.bindKey('backspace', () => {
      const cells = graph.getSelectedCells();
      if (cells.length) {
        graph.removeCells(cells);
      }
    });

    // 自定义事件--路径动画
    graph.on('signal', (cell: Cell) => {
      if (cell.isEdge()) {
        // 沿路径运动的动画
        // const view = graph.findViewByCell(cell);
        // if (view) {
        //   const token = Vector.create('circle', {
        //     r: 6,
        //     fill: 'red',
        //   });
        //   this.stop = view.sendToken(token.node, 1500);
        // }
      } else {
        // 触发事件 trigger
        const edges = graph.model.getConnectedEdges(cell, {
          outgoing: true,
        });
        // 消除定时器一秒的延迟
        edges.forEach((edge) => graph.trigger('signal', edge));
        this.interval = setInterval(() => {
          edges.forEach((edge) => graph.trigger('signal', edge));
        }, 1500);
      }
    });

    // 节点被选中时触发
    graph.on('node:click', ({ cell, node }) => {
      // console.log('edge id', node.getProp('id'));
      // console.log('node data', node.getData(),node.getProp('baseData'));

      // node.setProp('id', 'start');
      // graph
      //   .getNeighbors(node)
      //   .forEach((node) => console.log(node.getProp('zIndex')));

      // clearStyle();
      // 给该节点增加阴影效果
      // node.setAttrs({
      //   body: {
      //     filter: {
      //       name: 'highlight',
      //       args: {
      //         color: '#f4488d',
      //         width: 10,
      //         blur: 1,
      //         opacity: 0.25,
      //       },
      //     },
      //   },
      // });

      clearAnimate();

      // 启用输出边动画
      // const outgoingEdges = graph.getConnectedEdges(cell, {
      //   outgoing: true,
      // });
      // outgoingEdges.forEach((edge) => {
      //   edge.attr('line/strokeDasharray', 5);
      //   edge.attr('line/style', {
      //     animation: 'ant-line 30s infinite linear',
      //   });
      // });

      // 输入边增加样式
      // const incomingEdges = graph.getConnectedEdges(cell, {
      //   indirect: true,
      // });

      // incomingEdges.forEach((edge) => {
      //   edge.attr('line/stroke', 'orange');
      //   edge.attr('line/strokeWidth', 3);
      // });

      // graph.trigger('signal', node); // 启用路径动画
    });

    graph.on('edge:click', ({ edge }) => {
      // console.log('edge data', edge.getData(),edge.getProp('baseData'));
      // console.log('edge',edge.getAttrs());
      // console.log('edge id', edge.getProp('id'));
      // clearAnimate();
      // clearStyle();
      // edge.attr('line/strokeDasharray', 5);
      // edge.attr('line/style', {
      //   animation: 'ant-line 30s infinite linear',
      // });
    });

    graph.on('edge:connected', (args) => {
      const edge = args.edge;
      const node = args.currentCell;
      const elem = args.currentMagnet;
      const portId = elem?.getAttribute('port');

      this.handleEdgeTypeByNodeType(edge);

      // 解决sendToken第一次触发时，1000时长失效的bug
      // if (graph.model.getEdges().length === 1) {
      //   graph.trigger('signal', edge);
      // }

      // 触发 port 重新渲染
      // node.setPortProp(portId, 'connected', true);

      // 更新连线样式
      // edge.attr({
      //   line: {Edge
      //     strokeDasharray: '', // 让虚线变成实线
      //   },
      // });
    });
  }

  /**
   * 处理边类型(根据节点类型重置 边type)
   */
  private static handleEdgeTypeByNodeType = (edge: Edge) => {
    const cellData = edge.getData();
    const sourceCellData = edge.getSourceCell()?.getData();
    let edgeDataType;
    if (sourceCellData.type === 5) {
      edgeDataType = 4;
    } else if (sourceCellData.type === 6) {
      edgeDataType = 3;
    } else if (sourceCellData.type === 7) {
      edgeDataType = 8;
    }
    edge.setData({ ...cellData, type: edgeDataType });

    if (edgeDataType === 3) {
      // 置为实线
      edge.attr('line/strokeDasharray', '');
    } else if (edgeDataType === 4) {
      // 置为虚线
      // setAttr(5, cellRef.current.attr('line/strokeDasharray'));
      edge.attr('line/strokeDasharray', 5);
    } else if (edgeDataType === 8) {
      // 置为虚线
      // setAttr(5, cellRef.current.attr('line/strokeDasharray'));
      edge.attr('line/strokeDasharray', '20, 5');
    }
  };

  /**
   * 处理数据IsReadOnly
   */
  public static handleReadOnlyData(jsonData: any, isReadOnly: boolean) {
    const { graph } = this;
    // console.log('高亮',jsonData.cells.length,jsonData)
    if (jsonData.cells.length > 2) {
      jsonData.cells.map((item: any) => {
        const cell = graph.getCellById(item.id);
        const cellData = cell.getData();
        cell.setData({ ...cellData, isReadOnly });
      });
    }
  }

  /**
   * 处理高亮数据
   */
  private static handleLightData(lightJsonIdList: string[]) {
    if (lightJsonIdList === [] || lightJsonIdList === null) {
      return;
    }
    const { graph } = this;
    lightJsonIdList.map((id: string) => {
      const lightCell = graph.getCellById(id);
      if (lightCell !== null) {
        if (lightCell.isNode()) {
          lightCell.setAttrs({
            body: {
              filter: {
                name: 'highlight',
                args: {
                  color: 'LawnGreen',
                  width: 10,
                  blur: 1,
                  opacity: 0.25,
                },
              },
            },
          });
        } else {
          lightCell.attr('line/stroke', 'LawnGreen');
          // lightCell.attr('line/strokeWidth', 3);
          // lightCell.attr('line/style', {
          //   animation: 'ant-line 30s infinite linear',
          // });
        }
      }
    });
  }

  /**
   * 处理diff数据
   */
  private static handleDiffJsonData = () => {
    // console.log('handleDiffJsonData diffJsonDataOld', this.diffJsonDataOld);
    // console.log('handleDiffJsonData diffJsonDataNew', this.diffJsonDataNew);

    // let jsonData;
    const jsonData = { cells: this.diffJsonDataOld.cells.concat(this.diffJsonDataNew.cells) };
    const { graph } = this;
    // console.log('graph', graph);
    //TODO 处理旧数据和新数据的颜色 以及x轴
    const handleDiffJsonDataOld = this.diffJsonDataOld.cells.map((item: any) => {
      // console.log('item.id', item.id);
      const cell = graph.getCellById(item.id);
      // console.log('handleDiffJsonData map cell', cell);

      // if(cell.isNode()) {
      //   // 处理节点
      //   cell.setAttrs({
      //     body: {
      //       filter: {
      //         name: 'highlight',
      //         args: {
      //           color: 'Red',
      //           width: 10,
      //           blur: 1,
      //           opacity: 0.25,
      //         },
      //       },
      //     },
      //   });
      // }else{
      //   // 处理边
      //   cell.attr('line/stroke', 'Red');
      // }
      // return cell;
    });
    // console.log('handleDiffJsonDataOld', handleDiffJsonDataOld);

    // //TODO 处理新数据和新数据的颜色 以及x轴
    // this.diffJsonDataNew.cells.map((cell: any) => {
    //     if(cell.isNode()) {
    //       // 处理节点
    //     }else{
    //       // 处理边
    //     }
    // })

    return jsonData;
  };

  /**
   * 画布销毁、资源回收
   */
  public static graphDispose() {
    if (this.graph !== undefined) {
      // 清除自定义初始化数据
      this.initJsonData = null;
      this.lightJsonData = [];
      this.diffJsonDataOld = null;
      this.diffJsonDataNew = null;
      // 清除定时器
      clearInterval(this.interval);
      this.graph.clearCells();
      this.graph.clearGrid();
      this.graph.dispose();
      // this.graph = undefined;
      // this.stencil = undefined;

      // const wrapper = document.querySelector('#wrapper');
      // const container = document.querySelector('#container'); //document.getElementById('container');
      // const stenci = document.querySelector('#stenci');
      const graphScroller = document.querySelector('.x6-graph-scroller');

      if (graphScroller) {
        graphScroller.innerHTML = '';
        graphScroller.setAttribute('style', '');
        graphScroller.setAttribute('class', '');
      }
      if (this.stenciRef) {
        this.stenciRef.innerHTML = '';
        this.stenciRef.setAttribute('style', '');
        this.stenciRef.setAttribute('class', '');
      }
      if (this.containerRef) {
        this.containerRef.innerHTML = '';
        this.containerRef.setAttribute('style', '');
        this.containerRef.setAttribute('class', '');
      }
      // this.graph?.dispose();
    }
  }
}
