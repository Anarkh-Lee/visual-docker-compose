import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { 
  Database, Globe, Layout, Zap, Boxes,
  Coffee, Server, Code, Terminal, FileCode, Share2, BarChart,
  Bot, MessageSquare, Layers, FileDigit, Send, Wifi,
  Navigation, ShieldAlert, RefreshCw, Activity, PieChart, Search,
  Compass, Key, Wrench, GitBranch, HardDrive, Mail, Box
} from 'lucide-react';
import { ServiceConfig, ServiceType, SERVICE_TEMPLATES } from '@/types/docker';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ElementType> = {
  Coffee, Server, Code, Terminal, FileCode, Database, Share2, BarChart,
  Zap, Bot, MessageSquare, Layers, FileDigit, Send, Wifi,
  Navigation, ShieldAlert, Globe, RefreshCw, Activity, PieChart, Search,
  Layout, Compass, Key, Wrench, GitBranch, HardDrive, Mail, Box, Boxes
};

const getIcon = (type: ServiceType): React.ElementType => {
  const template = SERVICE_TEMPLATES.find(t => t.type === type);
  return iconMap[template?.icon || 'Database'] || Database;
};

const getColor = (type: ServiceType): string => {
  const colors: Record<string, string> = {
    spring: 'border-green-500/50 hover:border-green-500',
    nodejs: 'border-emerald-500/50 hover:border-emerald-500',
    python: 'border-yellow-500/50 hover:border-yellow-500',
    golang: 'border-cyan-500/50 hover:border-cyan-500',
    php: 'border-indigo-500/50 hover:border-indigo-500',
    openjdk: 'border-orange-500/50 hover:border-orange-500',
    mysql: 'border-blue-500/50 hover:border-blue-500',
    postgresql: 'border-blue-400/50 hover:border-blue-400',
    mongodb: 'border-green-600/50 hover:border-green-600',
    redis: 'border-red-500/50 hover:border-red-500',
    mariadb: 'border-amber-600/50 hover:border-amber-600',
    neo4j: 'border-blue-300/50 hover:border-blue-300',
    clickhouse: 'border-yellow-400/50 hover:border-yellow-400',
    ollama: 'border-purple-500/50 hover:border-purple-500',
    milvus: 'border-blue-500/50 hover:border-blue-500',
    chromadb: 'border-orange-400/50 hover:border-orange-400',
    pgvector: 'border-blue-400/50 hover:border-blue-400',
    rabbitmq: 'border-orange-500/50 hover:border-orange-500',
    kafka: 'border-gray-400/50 hover:border-gray-400',
    zookeeper: 'border-amber-700/50 hover:border-amber-700',
    rocketmq: 'border-orange-600/50 hover:border-orange-600',
    mosquitto: 'border-purple-400/50 hover:border-purple-400',
    nacos: 'border-sky-400/50 hover:border-sky-400',
    sentinel: 'border-rose-400/50 hover:border-rose-400',
    gateway: 'border-violet-400/50 hover:border-violet-400',
    seata: 'border-teal-400/50 hover:border-teal-400',
    prometheus: 'border-orange-500/50 hover:border-orange-500',
    grafana: 'border-orange-400/50 hover:border-orange-400',
    elasticsearch: 'border-yellow-500/50 hover:border-yellow-500',
    kibana: 'border-pink-400/50 hover:border-pink-400',
    zipkin: 'border-orange-300/50 hover:border-orange-300',
    nginx: 'border-green-500/50 hover:border-green-500',
    traefik: 'border-cyan-400/50 hover:border-cyan-400',
    keycloak: 'border-gray-400/50 hover:border-gray-400',
    jenkins: 'border-red-400/50 hover:border-red-400',
    'gitlab-runner': 'border-orange-500/50 hover:border-orange-500',
    minio: 'border-red-500/50 hover:border-red-500',
    mailhog: 'border-green-400/50 hover:border-green-400',
    portainer: 'border-cyan-500/50 hover:border-cyan-500',
    frontend: 'border-cyan-500/50 hover:border-cyan-500',
    microservice: 'border-indigo-400/50 hover:border-indigo-400',
  };
  return colors[type] || 'border-gray-500/50 hover:border-gray-500';
};

const getIconColor = (type: ServiceType): string => {
  const colors: Record<string, string> = {
    spring: 'text-green-400', nodejs: 'text-emerald-400', python: 'text-yellow-400',
    golang: 'text-cyan-400', php: 'text-indigo-400', openjdk: 'text-orange-400',
    mysql: 'text-blue-400', postgresql: 'text-blue-300', mongodb: 'text-green-500',
    redis: 'text-red-400', mariadb: 'text-amber-500', neo4j: 'text-blue-200',
    clickhouse: 'text-yellow-300', ollama: 'text-purple-400', milvus: 'text-blue-400',
    chromadb: 'text-orange-300', pgvector: 'text-blue-300', rabbitmq: 'text-orange-400',
    kafka: 'text-gray-300', zookeeper: 'text-amber-600', rocketmq: 'text-orange-500',
    mosquitto: 'text-purple-300', nacos: 'text-sky-300', sentinel: 'text-rose-300',
    gateway: 'text-violet-300', seata: 'text-teal-300', prometheus: 'text-orange-400',
    grafana: 'text-orange-300', elasticsearch: 'text-yellow-400', kibana: 'text-pink-300',
    zipkin: 'text-orange-200', nginx: 'text-green-400', traefik: 'text-cyan-300',
    keycloak: 'text-gray-300', jenkins: 'text-red-300', 'gitlab-runner': 'text-orange-400',
    minio: 'text-red-400', mailhog: 'text-green-300', portainer: 'text-cyan-400',
    frontend: 'text-cyan-400', microservice: 'text-indigo-300',
  };
  return colors[type] || 'text-gray-400';
};

const getGlow = (type: ServiceType): string => {
  const glows: Record<string, string> = {
    spring: 'shadow-green-500/30', nodejs: 'shadow-emerald-500/30', python: 'shadow-yellow-500/30',
    golang: 'shadow-cyan-500/30', php: 'shadow-indigo-500/30', openjdk: 'shadow-orange-500/30',
    mysql: 'shadow-blue-500/30', postgresql: 'shadow-blue-400/30', mongodb: 'shadow-green-600/30',
    redis: 'shadow-red-500/30', mariadb: 'shadow-amber-600/30', neo4j: 'shadow-blue-300/30',
    clickhouse: 'shadow-yellow-400/30', ollama: 'shadow-purple-500/30', milvus: 'shadow-blue-500/30',
    chromadb: 'shadow-orange-400/30', pgvector: 'shadow-blue-400/30', rabbitmq: 'shadow-orange-500/30',
    kafka: 'shadow-gray-400/30', zookeeper: 'shadow-amber-700/30', rocketmq: 'shadow-orange-600/30',
    mosquitto: 'shadow-purple-400/30', nacos: 'shadow-sky-400/30', sentinel: 'shadow-rose-400/30',
    gateway: 'shadow-violet-400/30', seata: 'shadow-teal-400/30', prometheus: 'shadow-orange-500/30',
    grafana: 'shadow-orange-400/30', elasticsearch: 'shadow-yellow-500/30', kibana: 'shadow-pink-400/30',
    zipkin: 'shadow-orange-300/30', nginx: 'shadow-green-500/30', traefik: 'shadow-cyan-400/30',
    keycloak: 'shadow-gray-400/30', jenkins: 'shadow-red-400/30', 'gitlab-runner': 'shadow-orange-500/30',
    minio: 'shadow-red-500/30', mailhog: 'shadow-green-400/30', portainer: 'shadow-cyan-500/30',
    frontend: 'shadow-cyan-500/30', microservice: 'shadow-indigo-400/30',
  };
  return glows[type] || 'shadow-gray-500/30';
};

interface ServiceNodeProps extends NodeProps {
  data: ServiceConfig;
  selected: boolean;
}

function ServiceNode({ data, selected }: ServiceNodeProps) {
  const Icon = getIcon(data.type);
  
  return (
    <div
      className={cn(
        'glass rounded-xl px-4 py-3 min-w-[180px] transition-all duration-200 cursor-pointer',
        'border-2',
        getColor(data.type),
        selected && ['border-opacity-100', 'shadow-lg', getGlow(data.type)]
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-primary !border-2 !border-background"
      />
      
      <div className="flex items-center gap-3">
        <div className={cn('p-2 rounded-lg bg-background/50', getIconColor(data.type))}>
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground text-sm truncate">{data.name}</h3>
          <p className="text-xs text-muted-foreground truncate">{data.image}</p>
        </div>
      </div>
      
      {data.ports && data.ports.length > 0 && data.ports[0] && (
        <div className="mt-2 flex flex-wrap gap-1">
          {data.ports.filter(p => p).slice(0, 2).map((port, idx) => (
            <span key={idx} className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
              {port}
            </span>
          ))}
          {data.ports.filter(p => p).length > 2 && (
            <span className="text-xs text-muted-foreground">+{data.ports.filter(p => p).length - 2}</span>
          )}
        </div>
      )}
      
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-accent !border-2 !border-background"
      />
    </div>
  );
}

export default memo(ServiceNode);
