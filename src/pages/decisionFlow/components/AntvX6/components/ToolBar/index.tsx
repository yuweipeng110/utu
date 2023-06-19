import React, { useEffect, useState } from 'react';
import { Toolbar } from '@antv/x6-react-components';
import FlowGraph from '../../Graph';
import { Cell, DataUri } from '@antv/x6';
import {
  ClearOutlined,
  SaveOutlined,
  PrinterOutlined,
  UndoOutlined,
  RedoOutlined,
  CopyOutlined,
  ScissorOutlined,
  SnippetsOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  DeleteOutlined,
  CompressOutlined,
  OneToOneOutlined,
  GatewayOutlined,
} from '@ant-design/icons';
import { createFromIconfontCN } from '@ant-design/icons';
import '@antv/x6-react-components/es/toolbar/style/index.css';

const MyIcon = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_2795231_31fes63fcwi.js', // 在 iconfont.cn 上生成
});

const { Item } = Toolbar;
const { Group } = Toolbar;

export default () => {
  const { graph } = FlowGraph;

  // // 选中的节点
  // // selectedNodes$: BehaviorSubject = new BehaviorSubject([])
  // const selectedCells = graph.getSelectedCells();
  // const selectedNodes = selectedCells.filter((cell) => cell.isNode());
  // const selectedEdges = selectedCells.filter((cell) => cell.isEdge());
  // const selectedGroups = selectedNodes.filter((cell) => {
  //   console.log('rrrrr',selectedNodes);
  //   const a =
  //   selectedNodes.filter(
  //     (cellItem) => {
  //       console.log('tttt',cellItem)
  //       return cellItem.isNode() && !cellItem.isGroup()},
  //   )
  //   return cell.isNode() && selectedNodes.isGroup()
  // });
  // const selectedGroup = selectedGroups.length === 1 ? selectedGroups[0] : undefined;

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [zoom, setZoom] = useState<number>(1);
  const [isShowGrid, setIsShowGrid] = useState<boolean>(true);
  const [selectionEnabled, setSelectionEnabled] = useState<boolean>(false);
  // // const [selectedNodes] = useObservableState(() => graph.selectedNodes$);
  // // const [selectedGroup] = useObservableState(() => graph.selectedGroup$);

  // const getSelectNodes = () => {
  //   const selectedCells = graph.getSelectedCells();
  //   const selectedNodes = selectedCells.filter((cell) => cell.isNode());
  //   const selectedEdges = selectedCells.filter((cell) => cell.isEdge());
  // };

  // const newGroupEnabled =
  //   !!selectedNodes &&
  //   !!selectedNodes.length &&
  //   selectedNodes.length > 1 &&
  //   selectedNodes.every((node) => {
  //     return node.isNode() && !node.getData<any>().groupId;
  //   });

  //   useEffect(() => {
  //     console.log('effect selectedNodes',selectedNodes);
  //   },[selectedNodes])

  // const unGroupEnabled = !selectedNodes?.length && !!selectedGroup;

  const formatCells = (cells:Cell[]) => {
    const newCells = cells.filter((item) => {
      const itemData = item.getData();
      return itemData.type !== 1 && itemData.type !== 2;
    });

    return newCells;
  };

  // 复制
  const copy = () => {
    const cells = graph.getSelectedCells();
    if (cells.length) {
      graph.copy(formatCells(cells));
    }
    return false;
  };

  // 剪切
  const cut = () => {
    const cells = graph.getSelectedCells();
    if (cells.length) {
      graph.cut(formatCells(cells));
    }
    return false;
  };

  // 粘贴
  const paste = () => {
    if (!graph.isClipboardEmpty()) {
      const cells = graph.paste({ offset: 32 });
      graph.cleanSelection();
      graph.select(cells);
    }
    return false;
  };

  // 放大
  const zoomIn = () => {
    const zoom = graph.zoom();
    if (zoom < 1.5) {
      graph.zoom(0.1);
    }
  };

  // 缩小
  const zoomOut = () => {
    const zoom = graph.zoom();
    if (zoom > 0.5) {
      graph.zoom(-0.1);
    }
  };

  // 缩放到适应画布
  const zoomGraphToFit = () => {
    graph.zoomToFit();
  };

  // 缩放到实际尺寸
  const zoomGraphRealSize = () => {
    graph?.scale(1);
    graph?.centerContent();
  };

  // 删除
  const deleteCell = () => {
    const cells = graph.getSelectedCells();
    if (cells.length) {
      graph.removeCells(formatCells(cells));
    }
  };

  // 显示网格
  const showGrid = () => {
    graph.showGrid();
    setIsShowGrid(true);
  };

  // 隐藏网格
  const hideGrid = () => {
    graph.hideGrid();
    setIsShowGrid(false);
  };

  // // 删除节点
  // const deleteNodes = (nodes: any) => {
  //   graph.removeCells(nodes);
  // };

  // // 清除选中节点
  // const unSelectNode = () => {
  //   if (graph) {
  //     graph.cleanSelection();
  //   }
  // };

  // 切换可框选模式
  const toggleSelectionEnabled = (enabled?: boolean) => {
    if (graph) {
      const needEnableRubberBand: boolean =
        typeof enabled === 'undefined' ? !graph.isRubberbandEnabled() : enabled;
      if (needEnableRubberBand) {
        graph.disablePanning();
        graph.enableRubberband();
        // graph.scroller.widget?.setCursor('crosshair', { silent: true })
      } else {
        graph.enablePanning();
        graph.disableRubberband();
        // graph.scroller.widget?.setCursor('grab', { silent: true })
      }
    }
  };

  // const splitGroup = () => {
  //   const descendantNodes = selectedGroup!.getDescendants();
  //   const childNodes = descendantNodes.filter((node) => node.isNode());
  //   childNodes.forEach((node) => {
  //     const nodeData = node.getData<any>();
  //     node.setData({ ...nodeData, groupId: 0 });
  //   });
  //   selectedGroup!.setChildren([]);
  //   deleteNodes(selectedGroup!);
  //   unSelectNode();
  // };

  useEffect(() => {
    const { graph } = FlowGraph;
    const { history } = graph;
    setCanUndo(history.canUndo());
    setCanRedo(history.canRedo());
    history.on('change', () => {
      setCanUndo(history.canUndo());
      setCanRedo(history.canRedo());
    });
    // zoom
    setZoom(graph.zoom());
    graph.on('scale', () => {
      setZoom(graph.zoom());
    });

    graph.bindKey(['meta+c', 'ctrl+c'], copy);
    graph.bindKey(['meta+x', 'ctrl+x'], cut);
    graph.bindKey(['meta+v', 'ctrl+v'], paste);
    // undo redo
    graph.bindKey(['meta+z', 'ctrl+z'], () => {
      if (graph.history.canUndo()) {
        graph.history.undo();
      }
      return false;
    });
    graph.bindKey(['meta+y', 'ctrl+y', 'meta+shift+z', 'ctrl+shift+z'], () => {
      if (graph.history.canRedo()) {
        graph.history.redo();
      }
      return false;
    });

    // select all
    graph.bindKey(['meta+a', 'ctrl+a'], () => {
      const nodes = graph.getNodes();
      if (nodes) {
        graph.select(nodes);
      }
    });

    // delete
    graph.bindKey('backspace', deleteCell);

    // zoom
    graph.bindKey(['ctrl+1', 'meta+1'], zoomIn);
    graph.bindKey(['ctrl+2', 'meta+2'], zoomOut);
    graph.bindKey(['ctrl+3', 'meta+3'], zoomGraphToFit);
    graph.bindKey(['ctrl+4', 'meta+4'], zoomGraphRealSize);
    graph.bindKey(['meta+d', 'ctrl+d'], deleteCell);
    // graph.bindKey(['meta+s', 'ctrl+s'], () => {
    //   graph.toPNG((datauri) => {
    //     DataUri.downloadDataUri(datauri, 'chart.png');
    //   });
    //   return false;
    // });
    graph.bindKey(['meta+p', 'ctrl+p'], () => {
      graph.printPreview();
      return false;
    });
  }, []);

  const handleClick = (name: string) => {
    switch (name) {
      case 'undo':
        graph.history.undo();
        break;
      case 'redo':
        graph.history.redo();
        break;
      case 'delete':
        graph.clearCells();
        break;
      case 'save':
        graph.toPNG((datauri) => {
          DataUri.downloadDataUri(datauri, 'chart.png');
        });
        break;
      case 'print':
        graph.printPreview();
        break;
      case 'copy':
        copy();
        break;
      case 'cut':
        cut();
        break;
      case 'paste':
        paste();
        break;
      case 'deleteCell':
        deleteCell();
        break;
      case 'zoomIn':
        zoomIn();
        break;
      case 'zoomOut':
        zoomOut();
        break;
      case 'zoomFit':
        zoomGraphToFit();
        break;
      case 'zoomReal':
        zoomGraphRealSize();
        break;
      case 'showGrid':
        showGrid();
        break;
      case 'hideGrid':
        hideGrid();
        break;
      case 'groupSelect':
        toggleSelectionEnabled();
        setSelectionEnabled((enabled) => !enabled);
        break;
      default:
        break;
    }
  };

  return (
    <div>
      <Toolbar hoverEffect={true} size="small" onClick={handleClick}>
        <Group>
          <Item name="delete" icon={<ClearOutlined />} tooltip="清空 (Cmd + D, Ctrl + D)" />
        </Group>
        <Group>
          <Item
            name="undo"
            tooltip="撤销 (Cmd + Z, Ctrl + Z)"
            icon={<UndoOutlined />}
            disabled={!canUndo}
          />
          <Item
            name="redo"
            tooltip="恢复 (Cmd + Shift + Z, Ctrl + Y)"
            icon={<RedoOutlined />}
            disabled={!canRedo}
          />
        </Group>
        <Group>
          <Item name="copy" tooltip="复制 (Cmd + C, Ctrl + C)" icon={<CopyOutlined />} />
          <Item name="cut" tooltip="剪切 (Cmd + X, Ctrl + X)" icon={<ScissorOutlined />} />
          <Item name="paste" tooltip="粘贴 (Cmd + V, Ctrl + V)" icon={<SnippetsOutlined />} />
          <Item name="deleteCell" tooltip="删除 (Cmd + D, Ctrl + D)" icon={<DeleteOutlined />} />
        </Group>
        <Group>
          <Item name="zoomIn" tooltip="放大 (Meta + 1, Ctrl + 1)" icon={<ZoomInOutlined />} />
          <Item name="zoomOut" tooltip="缩小 (Meta + 2, Ctrl + 2)" icon={<ZoomOutOutlined />} />
          <Item
            name="zoomFit"
            tooltip="实际尺寸 (Meta + 3, Ctrl + 3)"
            icon={<OneToOneOutlined />}
          />
          <Item
            name="zoomReal"
            tooltip="适应画布 (Meta + 4, Ctrl + 4)"
            icon={<CompressOutlined />}
          />
          <span style={{ lineHeight: '28px', fontSize: 12, marginRight: 4 }}>
            {`${(zoom * 100).toFixed(0)}%`}
          </span>
        </Group>
        <Group>
          {isShowGrid ? (
            <Item name="hideGrid" tooltip="网格" icon={<MyIcon type="icon-grid" />} />
          ) : (
            <Item name="showGrid" tooltip="网格" icon={<MyIcon type="icon-grid-frame" />} />
          )}
        </Group>
        <Group>
          <Item
            name="groupSelect"
            active={selectionEnabled}
            tooltip="框选节点"
            icon={<GatewayOutlined />}
          />
        </Group>
        {/* <Group>
          <Item
            name="createGoup"
            disabled={!newGroupEnabled}
            tooltip="新建群组"
            icon={<GroupOutlined />}
          />
          <Item
            name="splitGroup"
            disabled={!unGroupEnabled}
            tooltip="拆分群组"
            icon={<UngroupOutlined />}
          />
        </Group> */}
        <Group>
          <Item name="save" icon={<SaveOutlined />} tooltip="下载 (Cmd + S, Ctrl + S)" />
          <Item name="print" icon={<PrinterOutlined />} tooltip="打印 (Cmd + P, Ctrl + P)" />
        </Group>
      </Toolbar>
    </div>
  );
};
