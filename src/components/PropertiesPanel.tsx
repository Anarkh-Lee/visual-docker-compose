import { useState, useEffect } from 'react';
import { X, Plus, Trash2, FileText, List } from 'lucide-react';
import { ServiceConfig } from '@/types/docker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface PropertiesPanelProps {
  selectedNode: ServiceConfig | null;
  onUpdate: (config: Partial<ServiceConfig>) => void;
  onClose: () => void;
}

export function PropertiesPanel({ selectedNode, onUpdate, onClose }: PropertiesPanelProps) {
  const [ports, setPorts] = useState<string[]>([]);
  const [envVars, setEnvVars] = useState<{ key: string; value: string }[]>([]);
  const [volumes, setVolumes] = useState<{ host: string; container: string }[]>([]);
  const [envTextMode, setEnvTextMode] = useState(false);
  const [envText, setEnvText] = useState('');

  useEffect(() => {
    if (selectedNode) {
      setPorts(selectedNode.ports.length > 0 ? selectedNode.ports : ['']);
      
      const envEntries = Object.entries(selectedNode.environment);
      setEnvVars(
        envEntries.length > 0
          ? envEntries.map(([key, value]) => ({ key, value }))
          : [{ key: '', value: '' }]
      );
      setEnvText(envEntries.map(([k, v]) => `${k}=${v}`).join('\n'));
      
      // Parse volumes from "host:container" format
      const volumeEntries = selectedNode.volumes?.map(v => {
        const parts = v.split(':');
        return { host: parts[0] || '', container: parts[1] || '' };
      }) || [];
      setVolumes(volumeEntries.length > 0 ? volumeEntries : [{ host: '', container: '' }]);
    }
  }, [selectedNode?.id]);

  if (!selectedNode) {
    return (
      <aside className="w-80 bg-card border-l border-border flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">点击画布中的节点</p>
            <p className="text-sm">以编辑其配置</p>
          </div>
        </div>
      </aside>
    );
  }

  const handlePortChange = (index: number, value: string) => {
    const newPorts = [...ports];
    newPorts[index] = value;
    setPorts(newPorts);
    onUpdate({ ports: newPorts.filter(p => p.trim() !== '') });
  };

  const addPort = () => setPorts([...ports, '']);

  const removePort = (index: number) => {
    const newPorts = ports.filter((_, i) => i !== index);
    setPorts(newPorts.length > 0 ? newPorts : ['']);
    onUpdate({ ports: newPorts.filter(p => p.trim() !== '') });
  };

  const handleEnvChange = (index: number, field: 'key' | 'value', value: string) => {
    const newEnvVars = [...envVars];
    newEnvVars[index][field] = value;
    setEnvVars(newEnvVars);
    
    const envObject = Object.fromEntries(
      newEnvVars.filter(e => e.key.trim() !== '').map(e => [e.key, e.value])
    );
    onUpdate({ environment: envObject });
    setEnvText(newEnvVars.filter(e => e.key.trim() !== '').map(e => `${e.key}=${e.value}`).join('\n'));
  };

  const addEnvVar = () => setEnvVars([...envVars, { key: '', value: '' }]);

  const removeEnvVar = (index: number) => {
    const newEnvVars = envVars.filter((_, i) => i !== index);
    setEnvVars(newEnvVars.length > 0 ? newEnvVars : [{ key: '', value: '' }]);
    
    const envObject = Object.fromEntries(
      newEnvVars.filter(e => e.key.trim() !== '').map(e => [e.key, e.value])
    );
    onUpdate({ environment: envObject });
  };

  const handleEnvTextChange = (text: string) => {
    setEnvText(text);
    const lines = text.split('\n').filter(l => l.trim() !== '');
    const parsed = lines.map(line => {
      const idx = line.indexOf('=');
      if (idx === -1) return { key: line.trim(), value: '' };
      return { key: line.substring(0, idx).trim(), value: line.substring(idx + 1).trim() };
    });
    
    setEnvVars(parsed.length > 0 ? parsed : [{ key: '', value: '' }]);
    const envObject = Object.fromEntries(
      parsed.filter(e => e.key.trim() !== '').map(e => [e.key, e.value])
    );
    onUpdate({ environment: envObject });
  };

  const handleVolumeChange = (index: number, field: 'host' | 'container', value: string) => {
    const newVolumes = [...volumes];
    newVolumes[index][field] = value;
    setVolumes(newVolumes);
    
    const volumeStrings = newVolumes
      .filter(v => v.host.trim() !== '' || v.container.trim() !== '')
      .map(v => `${v.host}:${v.container}`);
    onUpdate({ volumes: volumeStrings });
  };

  const addVolume = () => setVolumes([...volumes, { host: '', container: '' }]);

  const removeVolume = (index: number) => {
    const newVolumes = volumes.filter((_, i) => i !== index);
    setVolumes(newVolumes.length > 0 ? newVolumes : [{ host: '', container: '' }]);
    
    const volumeStrings = newVolumes
      .filter(v => v.host.trim() !== '' || v.container.trim() !== '')
      .map(v => `${v.host}:${v.container}`);
    onUpdate({ volumes: volumeStrings });
  };

  return (
    <aside className="w-80 bg-card border-l border-border flex flex-col h-full animate-slide-in">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">属性配置</h2>
          <p className="text-xs text-muted-foreground">{selectedNode.name}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Container Name */}
        <div className="space-y-2">
          <Label htmlFor="containerName" className="text-sm font-medium">容器名称</Label>
          <Input
            id="containerName"
            value={selectedNode.containerName}
            onChange={(e) => onUpdate({ containerName: e.target.value })}
            placeholder="my-service"
            className="bg-secondary border-border"
          />
        </div>
        
        {/* Image */}
        <div className="space-y-2">
          <Label htmlFor="image" className="text-sm font-medium">镜像名称</Label>
          <Input
            id="image"
            value={selectedNode.image}
            onChange={(e) => onUpdate({ image: e.target.value })}
            placeholder="nginx:latest"
            className="bg-secondary border-border font-mono text-sm"
          />
        </div>
        
        {/* Ports */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">端口映射</Label>
            <Button variant="ghost" size="sm" onClick={addPort} className="h-7 text-xs">
              <Plus className="w-3 h-3 mr-1" />添加
            </Button>
          </div>
          <div className="space-y-2">
            {ports.map((port, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={port}
                  onChange={(e) => handlePortChange(index, e.target.value)}
                  placeholder="8080:80"
                  className="bg-secondary border-border font-mono text-sm"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removePort(index)}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Volumes - NEW! */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">数据卷挂载</Label>
            <Button variant="ghost" size="sm" onClick={addVolume} className="h-7 text-xs">
              <Plus className="w-3 h-3 mr-1" />添加
            </Button>
          </div>
          <div className="space-y-2">
            {volumes.map((vol, index) => (
              <div key={index} className="flex gap-1 items-center">
                <Input
                  value={vol.host}
                  onChange={(e) => handleVolumeChange(index, 'host', e.target.value)}
                  placeholder="./data"
                  className="bg-secondary border-border font-mono text-xs flex-1"
                />
                <span className="text-muted-foreground text-xs">:</span>
                <Input
                  value={vol.container}
                  onChange={(e) => handleVolumeChange(index, 'container', e.target.value)}
                  placeholder="/var/lib/data"
                  className="bg-secondary border-border font-mono text-xs flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeVolume(index)}
                  className="shrink-0 text-muted-foreground hover:text-destructive h-8 w-8"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground">格式: 宿主机路径 : 容器路径</p>
        </div>
        
        {/* Environment Variables */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">环境变量</Label>
            <div className="flex gap-1">
              <Button
                variant={envTextMode ? 'ghost' : 'secondary'}
                size="sm"
                onClick={() => setEnvTextMode(false)}
                className="h-7 text-xs px-2"
                title="列表模式"
              >
                <List className="w-3 h-3" />
              </Button>
              <Button
                variant={envTextMode ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setEnvTextMode(true)}
                className="h-7 text-xs px-2"
                title="文本模式"
              >
                <FileText className="w-3 h-3" />
              </Button>
              {!envTextMode && (
                <Button variant="ghost" size="sm" onClick={addEnvVar} className="h-7 text-xs">
                  <Plus className="w-3 h-3 mr-1" />添加
                </Button>
              )}
            </div>
          </div>
          
          {envTextMode ? (
            <div className="space-y-1">
              <Textarea
                value={envText}
                onChange={(e) => handleEnvTextChange(e.target.value)}
                placeholder="MYSQL_ROOT_PASSWORD=123456&#10;MYSQL_DATABASE=myapp&#10;KEY=value"
                className="bg-secondary border-border font-mono text-xs min-h-[120px] resize-none"
              />
              <p className="text-[10px] text-muted-foreground">每行一个环境变量，格式: KEY=value</p>
            </div>
          ) : (
            <div className="space-y-2">
              {envVars.map((env, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={env.key}
                    onChange={(e) => handleEnvChange(index, 'key', e.target.value)}
                    placeholder="KEY"
                    className="bg-secondary border-border font-mono text-sm flex-1"
                  />
                  <Input
                    value={env.value}
                    onChange={(e) => handleEnvChange(index, 'value', e.target.value)}
                    placeholder="value"
                    className="bg-secondary border-border font-mono text-sm flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEnvVar(index)}
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
