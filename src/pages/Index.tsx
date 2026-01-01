import { useState, useCallback, useMemo, useRef } from 'react';
import {
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Edge,
} from 'reactflow';
import { ServiceSidebar } from '@/components/ServiceSidebar';
import { CanvasFlow } from '@/components/CanvasFlow';
import { PropertiesPanel } from '@/components/PropertiesPanel';
import { YamlPreview } from '@/components/YamlPreview';
import { ImportYamlDialog } from '@/components/ImportYamlDialog';
import { NodeContextMenu } from '@/components/ContextMenu';
import { EnvManager } from '@/components/EnvManager';
import { useDockerCompose } from '@/hooks/useDockerCompose';
import { useEnvVariables } from '@/hooks/useEnvVariables';
import { ServiceConfig, ServiceType, SERVICE_TEMPLATES, ArchitectureTemplate, ARCHITECTURE_TEMPLATES } from '@/types/docker';
import { Container, Github, Trash2, ChevronDown, Rocket, Bot, Search, Copy, Edit, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

let nodeId = 0;
const getId = () => `node_${nodeId++}`;

const templateIcons: Record<string, React.ElementType> = {
  Rocket,
  Bot,
  Search,
};

interface NodeMenuState {
  node: Node | null;
  x: number;
  y: number;
}

export default function Index() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nodeMenu, setNodeMenu] = useState<NodeMenuState>({ node: null, x: 0, y: 0 });
  const [envManagerOpen, setEnvManagerOpen] = useState(false);

  const { generateYaml, parseYaml, downloadYaml, copyToClipboard } = useDockerCompose();
  const {
    envVariables,
    addVariable,
    updateVariable,
    removeVariable,
    parseEnvText,
    toEnvText,
    downloadEnv,
  } = useEnvVariables();

  const yaml = useMemo(() => generateYaml(nodes, edges), [nodes, edges, generateYaml]);

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    const node = nodes.find((n) => n.id === selectedNodeId);
    return node?.data as ServiceConfig | null;
  }, [nodes, selectedNodeId]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({ ...connection, animated: true }, eds));
    },
    [setEdges]
  );

  const onDragStart = useCallback(
    (event: React.DragEvent, serviceType: ServiceType) => {
      event.dataTransfer.setData('application/reactflow', serviceType);
      event.dataTransfer.effectAllowed = 'move';
    },
    []
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent, position: { x: number; y: number }) => {
      event.preventDefault();

      const serviceType = event.dataTransfer.getData('application/reactflow') as ServiceType;
      if (!serviceType) return;

      const template = SERVICE_TEMPLATES.find((t) => t.type === serviceType);
      if (!template) return;

      const id = getId();
      const newNode: Node<ServiceConfig> = {
        id,
        type: 'service',
        position,
        data: {
          id,
          type: template.type,
          name: template.label,
          containerName: template.type + '_' + id.split('_')[1],
          image: template.defaultImage,
          ports: [...template.defaultPorts],
          environment: { ...template.defaultEnv },
          volumes: [],
          dependsOn: [],
          privileged: template.privileged,
        },
      };

      setNodes((nds) => [...nds, newNode]);
      setSelectedNodeId(id);
    },
    [setNodes]
  );

  const onNodeClick = useCallback((node: Node) => {
    setSelectedNodeId(node.id);
    setNodeMenu({ node: null, x: 0, y: 0 });
  }, []);

  const onNodeContextMenu = useCallback((node: Node, event: React.MouseEvent) => {
    setNodeMenu({ node, x: event.clientX, y: event.clientY });
  }, []);

  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
    setNodeMenu({ node: null, x: 0, y: 0 });
    toast.success('节点已删除');
  }, [setNodes, setEdges, selectedNodeId]);

  const handleDeleteEdge = useCallback((edgeId: string) => {
    setEdges((eds) => eds.filter((e) => e.id !== edgeId));
    toast.success('连线已删除');
  }, [setEdges]);

  const handleDuplicateNode = useCallback(() => {
    if (!nodeMenu.node) return;
    
    const sourceNode = nodeMenu.node;
    const sourceData = sourceNode.data as ServiceConfig;
    const id = getId();
    
    const newNode: Node<ServiceConfig> = {
      id,
      type: 'service',
      position: {
        x: sourceNode.position.x + 50,
        y: sourceNode.position.y + 50,
      },
      data: {
        ...sourceData,
        id,
        name: `${sourceData.name} (副本)`,
        containerName: `${sourceData.type}_${id.split('_')[1]}`,
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setNodeMenu({ node: null, x: 0, y: 0 });
    setSelectedNodeId(id);
    toast.success('节点已复制');
  }, [nodeMenu.node, setNodes]);

  const handleEditNode = useCallback(() => {
    if (nodeMenu.node) {
      setSelectedNodeId(nodeMenu.node.id);
      setNodeMenu({ node: null, x: 0, y: 0 });
    }
  }, [nodeMenu.node]);

  const handleCloseNodeMenu = useCallback(() => {
    setNodeMenu({ node: null, x: 0, y: 0 });
  }, []);

  const handleUpdateNode = useCallback(
    (updates: Partial<ServiceConfig>) => {
      if (!selectedNodeId) return;

      setNodes((nds) =>
        nds.map((node) =>
          node.id === selectedNodeId
            ? { ...node, data: { ...node.data, ...updates } }
            : node
        )
      );
    },
    [selectedNodeId, setNodes]
  );

  const handleClosePanel = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const handleDownload = useCallback(() => {
    downloadYaml(yaml);
  }, [yaml, downloadYaml]);

  const handleCopy = useCallback(async () => {
    return copyToClipboard(yaml);
  }, [yaml, copyToClipboard]);

  const handleApplyTemplate = useCallback((template: ArchitectureTemplate) => {
    setNodes([]);
    setEdges([]);
    nodeId = 0;
    
    const newNodes: Node<ServiceConfig>[] = [];
    const newEdges: Edge[] = [];

    template.services.forEach((svc) => {
      const serviceTemplate = SERVICE_TEMPLATES.find((t) => t.type === svc.type);
      if (!serviceTemplate) return;

      const id = getId();
      const node: Node<ServiceConfig> = {
        id,
        type: 'service',
        position: svc.position,
        data: {
          id,
          type: serviceTemplate.type,
          name: svc.customName || serviceTemplate.label,
          containerName: `${serviceTemplate.type}_${id.split('_')[1]}`,
          image: serviceTemplate.defaultImage,
          ports: svc.overrides?.defaultPorts || [...serviceTemplate.defaultPorts],
          environment: { ...serviceTemplate.defaultEnv, ...svc.overrides?.defaultEnv },
          volumes: [],
          dependsOn: [],
          privileged: serviceTemplate.privileged,
        },
      };
      newNodes.push(node);
    });

    template.connections.forEach((conn) => {
      const sourceNode = newNodes[conn.from];
      const targetNode = newNodes[conn.to];
      if (sourceNode && targetNode) {
        newEdges.push({
          id: `edge_${sourceNode.id}_${targetNode.id}`,
          source: sourceNode.id,
          target: targetNode.id,
          animated: true,
        });
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);
    toast.success(`已生成 ${template.name}`, {
      description: `添加了 ${newNodes.length} 个服务和 ${newEdges.length} 个依赖关系`,
    });
  }, [setNodes, setEdges]);

  const handleClearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
    nodeId = 0;
    toast.success('画布已清空');
  }, [setNodes, setEdges]);

  const handleImportYaml = useCallback((yamlContent: string) => {
    const result = parseYaml(yamlContent);
    if (!result) {
      toast.error('解析失败', { description: '请检查 YAML 格式是否正确' });
      return;
    }

    setNodes([]);
    setEdges([]);
    nodeId = result.nodes.length;
    
    setNodes(result.nodes);
    setEdges(result.edges);
    setSelectedNodeId(null);
    
    toast.success('导入成功', {
      description: `已导入 ${result.nodes.length} 个服务和 ${result.edges.length} 个依赖关系`,
    });
  }, [parseYaml, setNodes, setEdges]);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden" onClick={handleCloseNodeMenu}>
      {/* Header */}
      <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Container className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              Docker Compose 可视化生成器
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Templates Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Rocket className="w-4 h-4" />
                快速模板
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {ARCHITECTURE_TEMPLATES.map((template) => {
                const Icon = templateIcons[template.icon] || Rocket;
                return (
                  <DropdownMenuItem
                    key={template.id}
                    onClick={() => handleApplyTemplate(template)}
                    className="cursor-pointer"
                  >
                    <Icon className="w-4 h-4 mr-2 text-primary" />
                    <div>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-xs text-muted-foreground">{template.description}</div>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Import YAML */}
          <ImportYamlDialog onImport={handleImportYaml} />

          {/* Env Manager */}
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setEnvManagerOpen(true)}
          >
            <FileText className="w-4 h-4" />
            环境变量 (.env)
          </Button>

          <span className="text-xs text-muted-foreground px-2 py-1 rounded bg-secondary">
            {nodes.length} 个服务
          </span>
          <span className="text-xs text-muted-foreground px-2 py-1 rounded bg-secondary">
            {edges.length} 个依赖
          </span>
          {nodes.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleClearCanvas}
            >
              <Trash2 className="w-4 h-4" />
              清空
            </Button>
          )}
          <a
            href="https://github.com/Anarkh-Lee/visual-docker-compose"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="ghost" size="sm" className="gap-2">
              <Github className="w-4 h-4" />
              GitHub
            </Button>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <ServiceSidebar onDragStart={onDragStart} onApplyTemplate={handleApplyTemplate} />

        {/* Canvas & Preview */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <CanvasFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onNodeContextMenu={onNodeContextMenu}
            onDeleteNode={handleDeleteNode}
            onDeleteEdge={handleDeleteEdge}
            onDrop={onDrop}
            onDragOver={onDragOver}
          />
          
          {/* Node Context Menu */}
          {nodeMenu.node && (
            <div
              className="fixed z-50 min-w-[10rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
              style={{ left: nodeMenu.x, top: nodeMenu.y }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleEditNode}
                className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none gap-2 hover:bg-accent"
              >
                <Edit className="w-4 h-4" />
                编辑配置
              </button>
              <button
                onClick={handleDuplicateNode}
                className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none gap-2 hover:bg-accent"
              >
                <Copy className="w-4 h-4" />
                复制节点
              </button>
              <div className="h-px bg-border my-1" />
              <button
                onClick={() => handleDeleteNode(nodeMenu.node!.id)}
                className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none gap-2 text-destructive hover:bg-accent hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
                删除节点
              </button>
            </div>
          )}
          
          <YamlPreview
            yaml={yaml}
            onDownload={handleDownload}
            onCopy={handleCopy}
            onDownloadEnv={downloadEnv}
            hasEnvVariables={envVariables.filter(v => v.key.trim()).length > 0}
          />
        </div>

        {/* Properties Panel */}
        <PropertiesPanel
          selectedNode={selectedNode}
          onUpdate={handleUpdateNode}
          onClose={handleClosePanel}
        />
      </div>

      {/* Env Manager Drawer */}
      <EnvManager
        open={envManagerOpen}
        onOpenChange={setEnvManagerOpen}
        envVariables={envVariables}
        onAddVariable={addVariable}
        onUpdateVariable={updateVariable}
        onRemoveVariable={removeVariable}
        onParseEnvText={parseEnvText}
        toEnvText={toEnvText}
        onDownloadEnv={downloadEnv}
      />
    </div>
  );
}
