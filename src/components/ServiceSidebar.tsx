import { 
  Database, Globe, Layout, Zap, GripVertical, Rocket, 
  Coffee, Server, Code, Terminal, FileCode, Share2, BarChart,
  Bot, MessageSquare, Layers, FileDigit, Send, Wifi,
  Navigation, ShieldAlert, RefreshCw, Activity, PieChart, Search,
  Compass, Key, Wrench, GitBranch, HardDrive, Mail, Box,
  Code2, Boxes, Shield
} from 'lucide-react';
import { SERVICE_TEMPLATES, ServiceType, ARCHITECTURE_TEMPLATES, ArchitectureTemplate, CATEGORIES, ServiceCategory } from '@/types/docker';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

const iconMap: Record<string, React.ElementType> = {
  Coffee, Server, Code, Terminal, FileCode, Database, Share2, BarChart,
  Zap, Bot, MessageSquare, Layers, FileDigit, Send, Wifi,
  Navigation, ShieldAlert, Globe, RefreshCw, Activity, PieChart, Search,
  Layout, Compass, Key, Wrench, GitBranch, HardDrive, Mail, Box,
  Code2, Boxes, Shield, Rocket
};

const categoryIconMap: Record<ServiceCategory, React.ElementType> = {
  runtimes: Code2,
  databases: Database,
  ai: Bot,
  messaging: MessageSquare,
  microservices: Boxes,
  observability: Activity,
  security: Shield,
  devtools: Wrench,
};

interface ServiceSidebarProps {
  onDragStart: (event: React.DragEvent, serviceType: ServiceType) => void;
  onApplyTemplate: (template: ArchitectureTemplate) => void;
}

export function ServiceSidebar({ onDragStart, onApplyTemplate }: ServiceSidebarProps) {
  const getServicesByCategory = (category: ServiceCategory) => {
    return SERVICE_TEMPLATES.filter(t => t.category === category);
  };

  return (
    <aside className="w-72 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="text-lg font-semibold text-sidebar-foreground">
          组件服务库
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          拖拽组件到画布中
        </p>
      </div>

      {/* 模板按钮区域 */}
      <div className="p-3 border-b border-sidebar-border space-y-2">
        <p className="text-xs text-muted-foreground mb-2">🚀 一键生成架构模板</p>
        {ARCHITECTURE_TEMPLATES.map((template) => {
          const TemplateIcon = iconMap[template.icon] || Rocket;
          return (
            <Button
              key={template.id}
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 border-primary/30"
              onClick={() => onApplyTemplate(template)}
            >
              <TemplateIcon className="w-4 h-4 text-primary" />
              <span className="truncate">{template.name}</span>
            </Button>
          );
        })}
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <Accordion 
          type="multiple" 
          defaultValue={['ai', 'databases', 'runtimes']}
          className="w-full"
        >
          {CATEGORIES.map((category) => {
            const CategoryIcon = categoryIconMap[category.id];
            const services = getServicesByCategory(category.id);
            
            return (
              <AccordionItem key={category.id} value={category.id} className="border-b border-sidebar-border">
                <AccordionTrigger className="px-3 py-2 hover:no-underline hover:bg-sidebar-accent/50">
                  <div className="flex items-center gap-2">
                    <CategoryIcon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-sidebar-foreground">{category.label}</span>
                    <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">
                      {services.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-2">
                  <div className="space-y-1 px-2">
                    {services.map((template) => {
                      const Icon = iconMap[template.icon] || Database;
                      
                      return (
                        <div
                          key={template.type}
                          draggable
                          onDragStart={(e) => onDragStart(e, template.type)}
                          className={cn(
                            'group flex items-center gap-2 p-2 rounded-lg cursor-grab active:cursor-grabbing',
                            'bg-sidebar-accent/30 hover:bg-sidebar-accent',
                            'border border-transparent hover:border-sidebar-border',
                            'transition-all duration-200',
                            'hover:shadow-lg hover:shadow-black/10'
                          )}
                        >
                          <div className="text-muted-foreground/50 group-hover:text-sidebar-foreground transition-colors">
                            <GripVertical className="w-3 h-3" />
                          </div>
                          
                          <div className={cn(
                            'p-1.5 rounded-md',
                            'bg-primary/10'
                          )}>
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <h3 className="text-xs font-medium text-sidebar-foreground truncate">
                                {template.label}
                              </h3>
                              {template.description && (
                                <span className="text-[10px] text-amber-500">✨</span>
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {template.defaultPorts.length > 0 
                                ? `端口: ${template.defaultPorts[0].split(':')[0]}`
                                : template.defaultImage.split(':')[0].split('/').pop()
                              }
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
      
      <div className="p-3 border-t border-sidebar-border">
        <div className="text-xs text-muted-foreground space-y-1">
          <p>💡 提示：</p>
          <p>• 拖拽服务到画布</p>
          <p>• 连接节点表示依赖</p>
          <p>• 点击节点编辑配置</p>
        </div>
      </div>
    </aside>
  );
}
