import { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  NodeTypes,
  OnNodesChange,
  OnEdgesChange,
} from 'reactflow';
import 'reactflow/dist/style.css';
import ServiceNode from './ServiceNode';
import { EdgeContextMenu } from './ContextMenu';
import { ServiceConfig, SERVICE_TEMPLATES } from '@/types/docker';

const nodeTypes: NodeTypes = {
  service: ServiceNode,
};

interface EdgeMenuState {
  edge: Edge | null;
  x: number;
  y: number;
}

interface CanvasFlowProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  onNodeClick: (node: Node) => void;
  onNodeContextMenu: (node: Node, event: React.MouseEvent) => void;
  onDeleteNode: (nodeId: string) => void;
  onDeleteEdge: (edgeId: string) => void;
  onDrop: (event: React.DragEvent, position: { x: number; y: number }) => void;
  onDragOver: (event: React.DragEvent) => void;
}

export function CanvasFlow({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onNodeContextMenu,
  onDeleteEdge,
  onDrop,
  onDragOver,
}: CanvasFlowProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [edgeMenu, setEdgeMenu] = useState<EdgeMenuState>({ edge: null, x: 0, y: 0 });

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onNodeClick(node);
    },
    [onNodeClick]
  );

  const handleNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      onNodeContextMenu(node, event);
    },
    [onNodeContextMenu]
  );

  const handleEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault();
      setEdgeMenu({ edge, x: event.clientX, y: event.clientY });
    },
    []
  );

  const handlePaneClick = useCallback(() => {
    setEdgeMenu({ edge: null, x: 0, y: 0 });
  }, []);

  const handleDeleteEdge = useCallback(() => {
    if (edgeMenu.edge) {
      onDeleteEdge(edgeMenu.edge.id);
    }
  }, [edgeMenu.edge, onDeleteEdge]);

  const handleCloseEdgeMenu = useCallback(() => {
    setEdgeMenu({ edge: null, x: 0, y: 0 });
  }, []);

  return (
    <div ref={reactFlowWrapper} className="flex-1 h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onNodeContextMenu={handleNodeContextMenu}
        onEdgeContextMenu={handleEdgeContextMenu}
        onPaneClick={handlePaneClick}
        onDrop={(e) => {
          const bounds = reactFlowWrapper.current?.getBoundingClientRect();
          if (bounds) {
            const position = {
              x: e.clientX - bounds.left,
              y: e.clientY - bounds.top,
            };
            onDrop(e, position);
          }
        }}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        deleteKeyCode={['Backspace', 'Delete']}
        edgesUpdatable
        edgesFocusable
        defaultEdgeOptions={{
          animated: true,
          style: { strokeWidth: 2 },
          focusable: true,
          deletable: true,
        }}
        connectionLineStyle={{ strokeWidth: 2 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="hsl(215 20% 20%)"
        />
        <Controls
          showZoom
          showFitView
          showInteractive
          position="bottom-left"
        />
        <MiniMap
          nodeColor={(node) => {
            const data = node.data as ServiceConfig;
            const template = SERVICE_TEMPLATES.find(t => t.type === data?.type);
            if (!template) return 'hsl(215 20% 30%)';
            
            const colorMap: Record<string, string> = {
              spring: 'hsl(140 60% 48%)', nodejs: 'hsl(145 60% 45%)', python: 'hsl(50 90% 50%)',
              golang: 'hsl(190 80% 50%)', php: 'hsl(240 60% 60%)', openjdk: 'hsl(30 90% 50%)',
              mysql: 'hsl(210 80% 55%)', postgresql: 'hsl(210 70% 50%)', mongodb: 'hsl(130 60% 45%)',
              redis: 'hsl(0 80% 55%)', mariadb: 'hsl(35 80% 50%)', neo4j: 'hsl(200 60% 60%)',
              clickhouse: 'hsl(45 90% 55%)', ollama: 'hsl(280 70% 55%)', milvus: 'hsl(210 70% 55%)',
              chromadb: 'hsl(25 80% 55%)', pgvector: 'hsl(210 60% 55%)', rabbitmq: 'hsl(25 85% 55%)',
              kafka: 'hsl(0 0% 50%)', zookeeper: 'hsl(35 60% 45%)', rocketmq: 'hsl(20 80% 50%)',
              mosquitto: 'hsl(280 50% 55%)', nacos: 'hsl(200 80% 55%)', sentinel: 'hsl(350 70% 55%)',
              gateway: 'hsl(260 60% 55%)', seata: 'hsl(170 60% 50%)', prometheus: 'hsl(25 85% 55%)',
              grafana: 'hsl(30 80% 55%)', elasticsearch: 'hsl(45 90% 55%)', kibana: 'hsl(330 60% 55%)',
              zipkin: 'hsl(20 70% 55%)', nginx: 'hsl(140 70% 45%)', traefik: 'hsl(190 70% 50%)',
              keycloak: 'hsl(0 0% 55%)', jenkins: 'hsl(0 60% 50%)', 'gitlab-runner': 'hsl(25 80% 55%)',
              minio: 'hsl(0 70% 55%)', mailhog: 'hsl(140 60% 50%)', portainer: 'hsl(190 70% 55%)',
              frontend: 'hsl(212 92% 67%)', microservice: 'hsl(240 50% 60%)',
              k3s: 'hsl(210 80% 55%)', 'docker-dind': 'hsl(210 90% 50%)',
            };
            
            return colorMap[data.type] || 'hsl(215 20% 30%)';
          }}
          maskColor="hsl(215 28% 7% / 0.8)"
          position="bottom-right"
          style={{ marginBottom: 10, marginRight: 10 }}
        />
      </ReactFlow>
      
      {edgeMenu.edge && (
        <EdgeContextMenu
          x={edgeMenu.x}
          y={edgeMenu.y}
          onDelete={handleDeleteEdge}
          onClose={handleCloseEdgeMenu}
        />
      )}
    </div>
  );
}
