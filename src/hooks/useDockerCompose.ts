import { useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import yaml from 'js-yaml';
import { ServiceConfig, ServiceType, SERVICE_TEMPLATES } from '@/types/docker';

interface DockerComposeService {
  image: string;
  container_name?: string;
  ports?: string[];
  environment?: Record<string, string> | string[];
  volumes?: string[];
  depends_on?: string[] | Record<string, { condition?: string }>;
  restart?: string;
}

interface DockerCompose {
  version?: string;
  services: Record<string, DockerComposeService>;
  networks?: Record<string, object>;
}

export function useDockerCompose() {
  const generateYaml = useCallback((nodes: Node[], edges: Edge[]): string => {
    if (nodes.length === 0) {
      return '# 请将服务拖拽到画布中开始构建\nversion: "3.8"\nservices: {}';
    }

    const services: Record<string, DockerComposeService> = {};

    nodes.forEach((node) => {
      const config = node.data as ServiceConfig;
      if (!config) return;

      const serviceName = config.containerName || config.name || node.id;
      
      const dependencies = edges
        .filter((edge) => edge.source === node.id)
        .map((edge) => {
          const targetNode = nodes.find((n) => n.id === edge.target);
          if (targetNode?.data) {
            const targetConfig = targetNode.data as ServiceConfig;
            return targetConfig.containerName || targetConfig.name || edge.target;
          }
          return edge.target;
        });

      const service: DockerComposeService = {
        image: config.image,
        restart: 'unless-stopped',
      };

      if (config.containerName) {
        service.container_name = config.containerName;
      }

      if (config.ports && config.ports.length > 0) {
        service.ports = config.ports.filter(p => p.trim() !== '');
      }

      if (config.environment && Object.keys(config.environment).length > 0) {
        const filteredEnv = Object.fromEntries(
          Object.entries(config.environment).filter(([k, v]) => k.trim() !== '' && v.trim() !== '')
        );
        if (Object.keys(filteredEnv).length > 0) {
          service.environment = filteredEnv;
        }
      }

      if (config.volumes && config.volumes.length > 0) {
        const filteredVolumes = config.volumes.filter(v => v.trim() !== '');
        if (filteredVolumes.length > 0) {
          service.volumes = filteredVolumes;
        }
      }

      if (dependencies.length > 0) {
        service.depends_on = dependencies;
      }

      services[serviceName] = service;
    });

    const compose: DockerCompose = {
      version: '3.8',
      services,
    };

    if (Object.keys(services).length > 0) {
      compose.networks = {
        app_network: { driver: 'bridge' },
      };
    }

    try {
      return yaml.dump(compose, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
        quotingType: '"',
        forceQuotes: false,
      });
    } catch (error) {
      console.error('YAML generation error:', error);
      return '# 生成 YAML 时发生错误';
    }
  }, []);

  const parseYaml = useCallback((yamlContent: string): { nodes: Node<ServiceConfig>[]; edges: Edge[] } | null => {
    try {
      const parsed = yaml.load(yamlContent) as DockerCompose;
      
      if (!parsed || !parsed.services) {
        throw new Error('Invalid docker-compose format');
      }

      const nodes: Node<ServiceConfig>[] = [];
      const edges: Edge[] = [];
      const serviceNameToId: Record<string, string> = {};

      // Calculate grid positions
      const serviceNames = Object.keys(parsed.services);
      const cols = Math.ceil(Math.sqrt(serviceNames.length));
      
      serviceNames.forEach((serviceName, index) => {
        const service = parsed.services[serviceName];
        const nodeId = `node_${index}`;
        serviceNameToId[serviceName] = nodeId;

        // Try to detect service type from image name
        const imageLower = (service.image || '').toLowerCase();
        let detectedType: ServiceType = 'spring';
        
        for (const template of SERVICE_TEMPLATES) {
          const templateImage = template.defaultImage.toLowerCase();
          const imageBase = templateImage.split(':')[0].split('/').pop() || '';
          if (imageLower.includes(imageBase) || imageLower.includes(template.type)) {
            detectedType = template.type;
            break;
          }
        }

        // Parse environment variables
        let environment: Record<string, string> = {};
        if (service.environment) {
          if (Array.isArray(service.environment)) {
            service.environment.forEach((env) => {
              const idx = env.indexOf('=');
              if (idx !== -1) {
                environment[env.substring(0, idx)] = env.substring(idx + 1);
              }
            });
          } else {
            environment = service.environment;
          }
        }

        // Grid layout
        const col = index % cols;
        const row = Math.floor(index / cols);
        const x = 150 + col * 250;
        const y = 100 + row * 180;

        const node: Node<ServiceConfig> = {
          id: nodeId,
          type: 'service',
          position: { x, y },
          data: {
            id: nodeId,
            type: detectedType,
            name: serviceName,
            containerName: service.container_name || serviceName,
            image: service.image || 'unknown',
            ports: service.ports || [],
            environment,
            volumes: service.volumes || [],
            dependsOn: [],
          },
        };

        nodes.push(node);
      });

      // Create edges from depends_on
      serviceNames.forEach((serviceName) => {
        const service = parsed.services[serviceName];
        const sourceId = serviceNameToId[serviceName];
        
        let dependsOn: string[] = [];
        if (service.depends_on) {
          if (Array.isArray(service.depends_on)) {
            dependsOn = service.depends_on;
          } else {
            dependsOn = Object.keys(service.depends_on);
          }
        }

        dependsOn.forEach((depName) => {
          const targetId = serviceNameToId[depName];
          if (targetId) {
            edges.push({
              id: `edge_${sourceId}_${targetId}`,
              source: sourceId,
              target: targetId,
              animated: true,
            });
          }
        });
      });

      return { nodes, edges };
    } catch (error) {
      console.error('YAML parse error:', error);
      return null;
    }
  }, []);

  const downloadYaml = useCallback((yamlContent: string) => {
    const blob = new Blob([yamlContent], { type: 'text/yaml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'docker-compose.yml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Copy failed:', error);
      return false;
    }
  }, []);

  return {
    generateYaml,
    parseYaml,
    downloadYaml,
    copyToClipboard,
  };
}
