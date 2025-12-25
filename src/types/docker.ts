export interface ServiceConfig {
  id: string;
  type: ServiceType;
  name: string;
  containerName: string;
  image: string;
  ports: string[];
  environment: Record<string, string>;
  volumes: string[];
  dependsOn: string[];
}

export type ServiceType = 
  | 'spring' | 'nodejs' | 'python' | 'golang' | 'php' | 'openjdk'
  | 'mysql' | 'postgresql' | 'mongodb' | 'redis' | 'mariadb' | 'neo4j' | 'clickhouse'
  | 'ollama' | 'milvus' | 'chromadb' | 'pgvector'
  | 'rabbitmq' | 'kafka' | 'zookeeper' | 'rocketmq' | 'mosquitto'
  | 'nacos' | 'sentinel' | 'gateway' | 'seata'
  | 'prometheus' | 'grafana' | 'elasticsearch' | 'kibana' | 'zipkin'
  | 'nginx' | 'traefik' | 'keycloak'
  | 'jenkins' | 'gitlab-runner' | 'minio' | 'mailhog' | 'portainer'
  | 'frontend' | 'microservice';

export type ServiceCategory = 'runtimes' | 'databases' | 'ai' | 'messaging' | 'microservices' | 'observability' | 'security' | 'devtools';

export interface ServiceTemplate {
  type: ServiceType;
  category: ServiceCategory;
  label: string;
  icon: string;
  defaultImage: string;
  defaultPorts: string[];
  defaultEnv: Record<string, string>;
  color: string;
  description?: string;
}

export interface CategoryInfo {
  id: ServiceCategory;
  label: string;
  icon: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'runtimes', label: '语言运行环境', icon: 'Code2' },
  { id: 'databases', label: '数据库', icon: 'Database' },
  { id: 'ai', label: 'AI 与向量数据库', icon: 'Bot' },
  { id: 'messaging', label: '消息队列', icon: 'MessageSquare' },
  { id: 'microservices', label: 'Spring Cloud 微服务', icon: 'Boxes' },
  { id: 'observability', label: '监控与日志', icon: 'Activity' },
  { id: 'security', label: '安全与网关', icon: 'Shield' },
  { id: 'devtools', label: '开发工具', icon: 'Wrench' },
];

export const SERVICE_TEMPLATES: ServiceTemplate[] = [
  // Runtimes
  { type: 'spring', category: 'runtimes', label: 'Spring Boot', icon: 'Coffee', defaultImage: 'openjdk:17-slim', defaultPorts: ['8080:8080'], defaultEnv: { JAVA_OPTS: '-Xmx512m' }, color: 'service-spring' },
  { type: 'nodejs', category: 'runtimes', label: 'Node.js', icon: 'Server', defaultImage: 'node:18-alpine', defaultPorts: ['3000:3000'], defaultEnv: { NODE_ENV: 'production' }, color: 'service-nodejs' },
  { type: 'python', category: 'runtimes', label: 'Python/Flask', icon: 'Code', defaultImage: 'python:3.11-slim', defaultPorts: ['5000:5000'], defaultEnv: { FLASK_ENV: 'production' }, color: 'service-python' },
  { type: 'golang', category: 'runtimes', label: 'Go App', icon: 'Terminal', defaultImage: 'golang:1.21-alpine', defaultPorts: ['8080:8080'], defaultEnv: {}, color: 'service-golang' },
  { type: 'php', category: 'runtimes', label: 'PHP-FPM', icon: 'FileCode', defaultImage: 'php:8.2-fpm', defaultPorts: ['9000:9000'], defaultEnv: {}, color: 'service-php' },
  { type: 'openjdk', category: 'runtimes', label: 'OpenJDK', icon: 'Coffee', defaultImage: 'openjdk:21-slim', defaultPorts: ['8080:8080'], defaultEnv: { JAVA_OPTS: '-Xmx512m' }, color: 'service-openjdk' },
  { type: 'frontend', category: 'runtimes', label: 'Vue/React 前端', icon: 'Layout', defaultImage: 'nginx:alpine', defaultPorts: ['80:80'], defaultEnv: {}, color: 'service-frontend' },
  // Databases
  { type: 'mysql', category: 'databases', label: 'MySQL', icon: 'Database', defaultImage: 'mysql:8.0', defaultPorts: ['3306:3306'], defaultEnv: { MYSQL_ROOT_PASSWORD: 'root123', MYSQL_DATABASE: 'app' }, color: 'service-mysql' },
  { type: 'postgresql', category: 'databases', label: 'PostgreSQL', icon: 'Database', defaultImage: 'postgres:15', defaultPorts: ['5432:5432'], defaultEnv: { POSTGRES_PASSWORD: 'postgres' }, color: 'service-postgresql' },
  { type: 'mongodb', category: 'databases', label: 'MongoDB', icon: 'Database', defaultImage: 'mongo:6.0', defaultPorts: ['27017:27017'], defaultEnv: { MONGO_INITDB_ROOT_USERNAME: 'admin', MONGO_INITDB_ROOT_PASSWORD: 'admin123' }, color: 'service-mongodb' },
  { type: 'redis', category: 'databases', label: 'Redis', icon: 'Zap', defaultImage: 'redis:alpine', defaultPorts: ['6379:6379'], defaultEnv: {}, color: 'service-redis' },
  { type: 'mariadb', category: 'databases', label: 'MariaDB', icon: 'Database', defaultImage: 'mariadb:10', defaultPorts: ['3306:3306'], defaultEnv: { MYSQL_ROOT_PASSWORD: 'root123' }, color: 'service-mariadb' },
  { type: 'neo4j', category: 'databases', label: 'Neo4j', icon: 'Share2', defaultImage: 'neo4j:latest', defaultPorts: ['7474:7474', '7687:7687'], defaultEnv: { NEO4J_AUTH: 'neo4j/password' }, color: 'service-neo4j', description: '知识图谱必备' },
  { type: 'clickhouse', category: 'databases', label: 'ClickHouse', icon: 'BarChart', defaultImage: 'clickhouse/clickhouse-server', defaultPorts: ['8123:8123'], defaultEnv: {}, color: 'service-clickhouse' },
  // AI & LLM
  { type: 'ollama', category: 'ai', label: 'Ollama', icon: 'Bot', defaultImage: 'ollama/ollama', defaultPorts: ['11434:11434'], defaultEnv: {}, color: 'service-ollama', description: '本地大模型' },
  { type: 'milvus', category: 'ai', label: 'Milvus', icon: 'Database', defaultImage: 'milvusdb/milvus:latest', defaultPorts: ['19530:19530'], defaultEnv: {}, color: 'service-milvus' },
  { type: 'chromadb', category: 'ai', label: 'ChromaDB', icon: 'Database', defaultImage: 'chromadb/chroma', defaultPorts: ['8000:8000'], defaultEnv: {}, color: 'service-chromadb' },
  { type: 'pgvector', category: 'ai', label: 'PgVector', icon: 'Database', defaultImage: 'ankane/pgvector', defaultPorts: ['5432:5432'], defaultEnv: { POSTGRES_PASSWORD: 'postgres' }, color: 'service-pgvector' },
  // Messaging
  { type: 'rabbitmq', category: 'messaging', label: 'RabbitMQ', icon: 'MessageSquare', defaultImage: 'rabbitmq:management', defaultPorts: ['5672:5672', '15672:15672'], defaultEnv: { RABBITMQ_DEFAULT_USER: 'admin', RABBITMQ_DEFAULT_PASS: 'admin' }, color: 'service-rabbitmq' },
  { type: 'kafka', category: 'messaging', label: 'Kafka', icon: 'Layers', defaultImage: 'bitnami/kafka:latest', defaultPorts: ['9092:9092'], defaultEnv: {}, color: 'service-kafka' },
  { type: 'zookeeper', category: 'messaging', label: 'Zookeeper', icon: 'FileDigit', defaultImage: 'zookeeper:3.8', defaultPorts: ['2181:2181'], defaultEnv: {}, color: 'service-zookeeper' },
  { type: 'rocketmq', category: 'messaging', label: 'RocketMQ', icon: 'Send', defaultImage: 'apache/rocketmq:latest', defaultPorts: ['9876:9876'], defaultEnv: {}, color: 'service-rocketmq' },
  { type: 'mosquitto', category: 'messaging', label: 'Mosquitto', icon: 'Wifi', defaultImage: 'eclipse-mosquitto', defaultPorts: ['1883:1883'], defaultEnv: {}, color: 'service-mosquitto', description: 'IoT MQTT' },
  // Microservices
  { type: 'nacos', category: 'microservices', label: 'Nacos', icon: 'Navigation', defaultImage: 'nacos/nacos-server:latest', defaultPorts: ['8848:8848'], defaultEnv: { MODE: 'standalone' }, color: 'service-nacos' },
  { type: 'sentinel', category: 'microservices', label: 'Sentinel', icon: 'ShieldAlert', defaultImage: 'bladex/sentinel-dashboard', defaultPorts: ['8858:8858'], defaultEnv: {}, color: 'service-sentinel' },
  { type: 'gateway', category: 'microservices', label: 'Gateway', icon: 'Globe', defaultImage: 'openjdk:17-slim', defaultPorts: ['8080:8080'], defaultEnv: {}, color: 'service-gateway' },
  { type: 'seata', category: 'microservices', label: 'Seata', icon: 'RefreshCw', defaultImage: 'seataio/seata-server:latest', defaultPorts: ['8091:8091'], defaultEnv: {}, color: 'service-seata', description: '分布式事务' },
  { type: 'microservice', category: 'microservices', label: '微服务', icon: 'Boxes', defaultImage: 'openjdk:17-slim', defaultPorts: ['8080:8080'], defaultEnv: {}, color: 'service-microservice' },
  // Observability
  { type: 'prometheus', category: 'observability', label: 'Prometheus', icon: 'Activity', defaultImage: 'prom/prometheus', defaultPorts: ['9090:9090'], defaultEnv: {}, color: 'service-prometheus' },
  { type: 'grafana', category: 'observability', label: 'Grafana', icon: 'PieChart', defaultImage: 'grafana/grafana', defaultPorts: ['3000:3000'], defaultEnv: { GF_SECURITY_ADMIN_PASSWORD: 'admin' }, color: 'service-grafana' },
  { type: 'elasticsearch', category: 'observability', label: 'Elasticsearch', icon: 'Search', defaultImage: 'elasticsearch:8.0.0', defaultPorts: ['9200:9200'], defaultEnv: { 'discovery.type': 'single-node' }, color: 'service-elasticsearch' },
  { type: 'kibana', category: 'observability', label: 'Kibana', icon: 'Layout', defaultImage: 'kibana:8.0.0', defaultPorts: ['5601:5601'], defaultEnv: {}, color: 'service-kibana' },
  { type: 'zipkin', category: 'observability', label: 'Zipkin', icon: 'Search', defaultImage: 'openzipkin/zipkin', defaultPorts: ['9411:9411'], defaultEnv: {}, color: 'service-zipkin' },
  // Security
  { type: 'nginx', category: 'security', label: 'Nginx', icon: 'Globe', defaultImage: 'nginx:alpine', defaultPorts: ['80:80', '443:443'], defaultEnv: {}, color: 'service-nginx' },
  { type: 'traefik', category: 'security', label: 'Traefik', icon: 'Compass', defaultImage: 'traefik:v2.9', defaultPorts: ['80:80', '8080:8080'], defaultEnv: {}, color: 'service-traefik', description: '云原生网关' },
  { type: 'keycloak', category: 'security', label: 'Keycloak', icon: 'Key', defaultImage: 'quay.io/keycloak/keycloak:latest', defaultPorts: ['8080:8080'], defaultEnv: { KEYCLOAK_ADMIN: 'admin', KEYCLOAK_ADMIN_PASSWORD: 'admin' }, color: 'service-keycloak', description: '身份认证' },
  // DevTools
  { type: 'jenkins', category: 'devtools', label: 'Jenkins', icon: 'Wrench', defaultImage: 'jenkins/jenkins:lts', defaultPorts: ['8080:8080', '50000:50000'], defaultEnv: {}, color: 'service-jenkins' },
  { type: 'gitlab-runner', category: 'devtools', label: 'GitLab Runner', icon: 'GitBranch', defaultImage: 'gitlab/gitlab-runner:latest', defaultPorts: [], defaultEnv: {}, color: 'service-gitlab' },
  { type: 'minio', category: 'devtools', label: 'MinIO', icon: 'HardDrive', defaultImage: 'minio/minio', defaultPorts: ['9000:9000', '9001:9001'], defaultEnv: { MINIO_ROOT_USER: 'admin', MINIO_ROOT_PASSWORD: 'admin123' }, color: 'service-minio' },
  { type: 'mailhog', category: 'devtools', label: 'Mailhog', icon: 'Mail', defaultImage: 'mailhog/mailhog', defaultPorts: ['1025:1025', '8025:8025'], defaultEnv: {}, color: 'service-mailhog', description: '邮件测试神器' },
  { type: 'portainer', category: 'devtools', label: 'Portainer', icon: 'Box', defaultImage: 'portainer/portainer-ce', defaultPorts: ['9000:9000'], defaultEnv: {}, color: 'service-portainer' },
];

export interface ArchitectureTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  services: { type: ServiceType; position: { x: number; y: number }; customName?: string; overrides?: Partial<Pick<ServiceTemplate, 'defaultPorts' | 'defaultEnv'>>; }[];
  connections: { from: number; to: number }[];
}

export const ARCHITECTURE_TEMPLATES: ArchitectureTemplate[] = [
  {
    id: 'spring-cloud', name: 'Spring Cloud 全家桶', description: '包含 Nacos, Sentinel, Gateway 和微服务', icon: 'Rocket',
    services: [
      { type: 'nacos', position: { x: 400, y: 50 } },
      { type: 'sentinel', position: { x: 100, y: 200 } },
      { type: 'gateway', position: { x: 400, y: 200 } },
      { type: 'microservice', position: { x: 250, y: 400 }, customName: 'user-service' },
      { type: 'microservice', position: { x: 550, y: 400 }, customName: 'order-service' },
    ],
    connections: [{ from: 1, to: 0 }, { from: 2, to: 0 }, { from: 3, to: 0 }, { from: 4, to: 0 }, { from: 3, to: 2 }, { from: 4, to: 2 }],
  },
  {
    id: 'ai-rag', name: 'AI RAG 架构', description: 'Ollama + 向量数据库 + Python', icon: 'Bot',
    services: [
      { type: 'ollama', position: { x: 400, y: 50 } },
      { type: 'chromadb', position: { x: 150, y: 200 } },
      { type: 'python', position: { x: 400, y: 200 }, customName: 'rag-service' },
      { type: 'redis', position: { x: 650, y: 200 } },
    ],
    connections: [{ from: 2, to: 0 }, { from: 2, to: 1 }, { from: 2, to: 3 }],
  },
  {
    id: 'elk-stack', name: 'ELK 日志栈', description: 'Elasticsearch + Kibana + 应用', icon: 'Search',
    services: [
      { type: 'elasticsearch', position: { x: 400, y: 50 } },
      { type: 'kibana', position: { x: 400, y: 200 } },
      { type: 'spring', position: { x: 200, y: 350 }, customName: 'app-service' },
      { type: 'nodejs', position: { x: 600, y: 350 }, customName: 'api-service' },
    ],
    connections: [{ from: 1, to: 0 }, { from: 2, to: 0 }, { from: 3, to: 0 }],
  },
];
