import { useState, useEffect } from 'react';
import { EnvVariable } from '@/hooks/useEnvVariables';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Download, 
  Copy,
  FileText,
  List,
} from 'lucide-react';
import { toast } from 'sonner';

interface EnvManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  envVariables: EnvVariable[];
  onAddVariable: () => void;
  onUpdateVariable: (index: number, field: keyof EnvVariable, value: string | boolean) => void;
  onRemoveVariable: (index: number) => void;
  onParseEnvText: (text: string) => void;
  toEnvText: () => string;
  onDownloadEnv: () => void;
}

export function EnvManager({
  open,
  onOpenChange,
  envVariables,
  onAddVariable,
  onUpdateVariable,
  onRemoveVariable,
  onParseEnvText,
  toEnvText,
  onDownloadEnv,
}: EnvManagerProps) {
  const [activeTab, setActiveTab] = useState<'gui' | 'text'>('gui');
  const [textContent, setTextContent] = useState('');
  const [visibleSecrets, setVisibleSecrets] = useState<Set<number>>(new Set());

  // Sync text content when switching to text mode
  useEffect(() => {
    if (activeTab === 'text') {
      setTextContent(toEnvText());
    }
  }, [activeTab, toEnvText]);

  const handleTabChange = (value: string) => {
    if (value === 'gui' && activeTab === 'text') {
      // Parse text content when switching to GUI mode
      onParseEnvText(textContent);
    }
    setActiveTab(value as 'gui' | 'text');
  };

  const toggleSecretVisibility = (index: number) => {
    setVisibleSecrets((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleCopyEnv = async () => {
    try {
      const content = activeTab === 'text' ? textContent : toEnvText();
      await navigator.clipboard.writeText(content);
      toast.success('已复制到剪贴板');
    } catch {
      toast.error('复制失败');
    }
  };

  const handleDownload = () => {
    if (activeTab === 'text') {
      onParseEnvText(textContent);
    }
    onDownloadEnv();
    toast.success('已下载 .env 文件');
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[60vh] bg-card border-t border-border">
        <DrawerHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <DrawerTitle className="flex items-center gap-2 text-foreground">
              <FileText className="w-5 h-5 text-accent" />
              环境变量 (.env) 管理器
            </DrawerTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground px-2 py-1 rounded bg-secondary">
                {envVariables.filter(v => v.key.trim()).length} 个变量
              </span>
            </div>
          </div>
        </DrawerHeader>

        <div className="flex-1 px-4 py-4 overflow-hidden">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full flex flex-col">
            <TabsList className="grid w-full max-w-xs grid-cols-2 mb-4 bg-secondary">
              <TabsTrigger value="gui" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <List className="w-4 h-4" />
                GUI 模式
              </TabsTrigger>
              <TabsTrigger value="text" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <FileText className="w-4 h-4" />
                文本模式
              </TabsTrigger>
            </TabsList>

            <TabsContent value="gui" className="flex-1 mt-0 overflow-hidden">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-2">
                  {/* Header Row */}
                  <div className="grid grid-cols-[1fr,1fr,auto,auto] gap-2 px-2 text-xs text-muted-foreground font-medium">
                    <span>变量名 (KEY)</span>
                    <span>值 (VALUE)</span>
                    <span className="w-8 text-center">隐藏</span>
                    <span className="w-8"></span>
                  </div>

                  {/* Variable Rows */}
                  {envVariables.map((variable, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-[1fr,1fr,auto,auto] gap-2 items-center p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <Input
                        value={variable.key}
                        onChange={(e) => onUpdateVariable(index, 'key', e.target.value)}
                        placeholder="ENV_KEY"
                        className="font-mono text-sm bg-code-bg border-code-border text-accent"
                      />
                      <div className="relative">
                        <Input
                          type={variable.isSecret && !visibleSecrets.has(index) ? 'password' : 'text'}
                          value={variable.value}
                          onChange={(e) => onUpdateVariable(index, 'value', e.target.value)}
                          placeholder="value"
                          className="font-mono text-sm bg-code-bg border-code-border pr-8"
                        />
                        {variable.isSecret && (
                          <button
                            type="button"
                            onClick={() => toggleSecretVisibility(index)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {visibleSecrets.has(index) ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => onUpdateVariable(index, 'isSecret', !variable.isSecret)}
                        className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                          variable.isSecret
                            ? 'text-accent bg-accent/20'
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                        }`}
                        title={variable.isSecret ? '取消隐藏' : '标记为敏感信息'}
                      >
                        {variable.isSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveVariable(index)}
                        className="w-8 h-8 flex items-center justify-center rounded text-destructive hover:bg-destructive/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* Add Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onAddVariable}
                    className="w-full mt-2 border-dashed border-border hover:border-primary hover:bg-primary/10"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    添加变量
                  </Button>

                  {envVariables.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">暂无环境变量</p>
                      <p className="text-xs mt-1">点击上方按钮添加，或切换到文本模式粘贴 .env 文件内容</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="text" className="flex-1 mt-0 overflow-hidden">
              <div className="h-full flex flex-col">
                <p className="text-xs text-muted-foreground mb-2">
                  直接粘贴或编辑 .env 文件内容，切换回 GUI 模式时将自动解析
                </p>
                <Textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder={`# 环境变量配置\n# 格式: KEY=value\n\nDATABASE_HOST=localhost\nDATABASE_PORT=5432\nDATABASE_PASSWORD="your_secret_password"`}
                  className="flex-1 font-mono text-sm bg-code-bg border-code-border resize-none leading-relaxed"
                  style={{ minHeight: '200px' }}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DrawerFooter className="border-t border-border pt-4">
          <div className="flex items-center justify-between w-full">
            <p className="text-xs text-muted-foreground">
              提示：在服务配置中使用 <code className="text-accent bg-code-bg px-1 rounded">${'${VARIABLE_NAME}'}</code> 引用变量
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyEnv} className="gap-2">
                <Copy className="w-4 h-4" />
                复制
              </Button>
              <Button variant="default" size="sm" onClick={handleDownload} className="gap-2">
                <Download className="w-4 h-4" />
                下载 .env
              </Button>
            </div>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
