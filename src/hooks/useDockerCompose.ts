import { useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import yaml from 'js-yaml';
import { ServiceConfig, ServiceType, SERVICE_TEMPLATES, BuildConfig, HealthcheckConfig, DependsOnConfig } from '@/types/docker';

interface DockerComposeService {
  image?: string;
  build?: string | BuildConfig;
  container_name?: string;
  ports?: string[];
  environment?: Record<string, string | number | boolean> | string[];
  volumes?: string[];
  depends_on?: string[] | Record<string, DependsOnConfig>;
  restart?: string;
  command?: string | string[];
  healthcheck?: HealthcheckConfig;
  networks?: string[];
  privileged?: boolean;
}

interface DockerCompose {
  version?: string;
  services: Record<string, DockerComposeService>;
  networks?: Record<string, { driver?: string } | null>;
}

export function useDockerCompose() {
  const generateYaml = useCallback((nodes: Node[], edges: Edge[]): string => {
    if (nodes.length === 0) {
      return '# 请将服务拖拽到画布中开始构建\nversion: "3.8"\nservices: {}';
    }

    const services: Record<string, DockerComposeService> = {};
    const usedNetworks = new Set<string>();

    // Build a map from node ID to service name for dependency resolution
    const nodeIdToServiceName: Record<string, string> = {};
    nodes.forEach((node) => {
      const config = node.data as ServiceConfig;
      if (config) {
        // Use the original service name (config.name) for service discovery, not container_name
        nodeIdToServiceName[node.id] = config.name || node.id;
      }
    });

    nodes.forEach((node) => {
      const config = node.data as ServiceConfig;
      if (!config) return;

      // IMPORTANT: Use config.name as service name for Docker service discovery
      // container_name is separate and only for Docker container naming
      const serviceName = config.name || node.id;
      
      // Find dependencies using edges
      const dependencies = edges
        .filter((edge) => edge.source === node.id)
        .map((edge) => nodeIdToServiceName[edge.target])
        .filter(Boolean);

      const service: DockerComposeService = {};

      // Handle build vs image - NEVER use "image: build:xxx" syntax
      if (config.build) {
        // Use build configuration
        if (typeof config.build === 'string') {
          service.build = { context: config.build };
        } else {
          service.build = config.build;
        }
      } else if (config.image && config.image.startsWith('build:')) {
        // Parse legacy "build:./path" format and convert to proper build syntax
        const buildPath = config.image.replace('build:', '');
        service.build = { context: buildPath };
      } else if (config.image) {
        service.image = config.image;
      }

      // Restart policy
      service.restart = config.restart || 'always';

      // Container name (optional, separate from service name)
      if (config.containerName && config.containerName !== serviceName) {
        service.container_name = config.containerName;
      }

      // Ports
      if (config.ports && config.ports.length > 0) {
        const filteredPorts = config.ports.filter(p => typeof p === 'string' && p.trim() !== '');
        if (filteredPorts.length > 0) {
          service.ports = filteredPorts;
        }
      }

      // Environment variables
      if (config.environment && Object.keys(config.environment).length > 0) {
        const filteredEnv = Object.fromEntries(
          Object.entries(config.environment).filter(([k, v]) => {
            const keyValid = typeof k === 'string' && k.trim() !== '';
            const valueValid = v !== undefined && v !== null && 
              (typeof v === 'string' ? v.trim() !== '' : true);
            return keyValid && valueValid;
          }).map(([k, v]) => [k, typeof v === 'string' ? v : String(v)])
        );
        if (Object.keys(filteredEnv).length > 0) {
          service.environment = filteredEnv;
        }
      }

      // Volumes
      if (config.volumes && config.volumes.length > 0) {
        const filteredVolumes = config.volumes.filter(v => typeof v === 'string' && v.trim() !== '');
        if (filteredVolumes.length > 0) {
          service.volumes = filteredVolumes;
        }
      }

      // Command
      if (config.command) {
        service.command = config.command;
      }

      // Healthcheck
      if (config.healthcheck) {
        service.healthcheck = config.healthcheck;
      }

      // Networks
      if (config.networks && config.networks.length > 0) {
        service.networks = config.networks;
        config.networks.forEach(n => usedNetworks.add(n));
      }

      // Privileged mode (for Docker-in-Docker, etc.)
      if (config.privileged) {
        service.privileged = true;
      }

      // Dependencies with conditions
      if (dependencies.length > 0 || (config.dependsOnConditions && Object.keys(config.dependsOnConditions).length > 0)) {
        const hasConditions = config.dependsOnConditions && Object.keys(config.dependsOnConditions).length > 0;
        
        if (hasConditions) {
          // Use object format with conditions
          const dependsOnObj: Record<string, DependsOnConfig> = {};
          
          dependencies.forEach(dep => {
            if (config.dependsOnConditions && config.dependsOnConditions[dep]) {
              dependsOnObj[dep] = config.dependsOnConditions[dep];
            } else {
              dependsOnObj[dep] = { condition: 'service_started' };
            }
          });
          
          // Also include any conditions that might not be in dependencies
          if (config.dependsOnConditions) {
            Object.entries(config.dependsOnConditions).forEach(([dep, cond]) => {
              if (!dependsOnObj[dep]) {
                dependsOnObj[dep] = cond;
              }
            });
          }
          
          service.depends_on = dependsOnObj;
        } else {
          // Simple array format
          service.depends_on = dependencies;
        }
      }

      services[serviceName] = service;
    });

    const compose: DockerCompose = {
      version: '3.8',
      services,
    };

    // Add networks if any service uses them
    if (usedNetworks.size > 0) {
      compose.networks = {};
      usedNetworks.forEach(networkName => {
        compose.networks![networkName] = { driver: 'bridge' };
      });
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
      const serviceNameToIndex: Record<string, number> = {};

      // Collect all network names used
      const networksUsed = new Set<string>();

      const serviceNames = Object.keys(parsed.services);
      
      // Build dependency graph for topological sorting
      const dependencyGraph: Record<string, string[]> = {};
      const reverseDeps: Record<string, string[]> = {};
      
      serviceNames.forEach((serviceName, index) => {
        serviceNameToIndex[serviceName] = index;
        dependencyGraph[serviceName] = [];
        reverseDeps[serviceName] = [];
      });
      
      // Populate dependency relationships
      serviceNames.forEach((serviceName) => {
        const service = parsed.services[serviceName];
        let deps: string[] = [];
        if (service.depends_on) {
          if (Array.isArray(service.depends_on)) {
            deps = service.depends_on;
          } else {
            deps = Object.keys(service.depends_on);
          }
        }
        deps.forEach((depName) => {
          if (dependencyGraph[depName] !== undefined) {
            dependencyGraph[serviceName].push(depName);
            reverseDeps[depName].push(serviceName);
          }
        });
      });
      
      // Compute levels using topological sort (Kahn's algorithm)
      // Level 0 = services with no dependencies (like databases)
      // Higher levels depend on lower levels
      const levels: Record<string, number> = {};
      const inDegree: Record<string, number> = {};
      
      serviceNames.forEach((name) => {
        inDegree[name] = dependencyGraph[name].length;
      });
      
      // Find all nodes with no dependencies (level 0)
      let currentLevel = 0;
      let queue = serviceNames.filter((name) => inDegree[name] === 0);
      
      while (queue.length > 0) {
        const nextQueue: string[] = [];
        queue.forEach((name) => {
          levels[name] = currentLevel;
          // Process services that depend on this one
          reverseDeps[name].forEach((dependent) => {
            inDegree[dependent]--;
            if (inDegree[dependent] === 0) {
              nextQueue.push(dependent);
            }
          });
        });
        queue = nextQueue;
        currentLevel++;
      }
      
      // Handle any remaining nodes (circular dependencies) - assign to last level
      serviceNames.forEach((name) => {
        if (levels[name] === undefined) {
          levels[name] = currentLevel;
        }
      });
      
      // Group services by level
      const levelGroups: Record<number, string[]> = {};
      serviceNames.forEach((name) => {
        const level = levels[name];
        if (!levelGroups[level]) {
          levelGroups[level] = [];
        }
        levelGroups[level].push(name);
      });
      
      // Calculate positions - bottom to top layout (level 0 at bottom)
      const maxLevel = Math.max(...Object.values(levels));
      const nodeWidth = 220;
      const nodeHeight = 120;
      const horizontalGap = 80;
      const verticalGap = 100;
      
      serviceNames.forEach((serviceName, index) => {
        const service = parsed.services[serviceName];
        const nodeId = `node_${index}`;
        serviceNameToId[serviceName] = nodeId;

        // Determine image name - support both 'image' and 'build' configurations
        let imageName = '';
        let buildConfig: string | BuildConfig | undefined;
        
        if (service.image) {
          imageName = service.image;
        } else if (service.build) {
          buildConfig = service.build;
          if (typeof service.build === 'string') {
            imageName = `build:${service.build}`;
          } else if (service.build.context) {
            imageName = `build:${service.build.context}`;
          } else {
            imageName = 'build:./';
          }
        } else {
          imageName = 'unknown';
        }

        // Try to detect service type from image name or service name
        const imageLower = imageName.toLowerCase();
        const serviceNameLower = serviceName.toLowerCase();
        let detectedType: ServiceType = 'spring';
        
        for (const template of SERVICE_TEMPLATES) {
          const templateImage = template.defaultImage.toLowerCase();
          const imageBase = templateImage.split(':')[0].split('/').pop() || '';
          if (imageLower.includes(imageBase) || imageLower.includes(template.type) ||
              serviceNameLower.includes(imageBase) || serviceNameLower.includes(template.type)) {
            detectedType = template.type;
            break;
          }
        }

        // Parse environment variables - convert all values to strings
        const environment: Record<string, string> = {};
        if (service.environment) {
          if (Array.isArray(service.environment)) {
            service.environment.forEach((env) => {
              if (typeof env === 'string') {
                const idx = env.indexOf('=');
                if (idx !== -1) {
                  environment[env.substring(0, idx)] = env.substring(idx + 1);
                }
              }
            });
          } else {
            Object.entries(service.environment).forEach(([key, value]) => {
              environment[key] = String(value);
            });
          }
        }

        // Parse depends_on conditions
        let dependsOnConditions: Record<string, DependsOnConfig> | undefined;
        if (service.depends_on && !Array.isArray(service.depends_on)) {
          dependsOnConditions = {};
          Object.entries(service.depends_on).forEach(([depName, depConfig]) => {
            if (depConfig && typeof depConfig === 'object' && depConfig.condition) {
              dependsOnConditions![depName] = { condition: depConfig.condition };
            }
          });
        }

        // Parse networks
        let networks: string[] | undefined;
        if (service.networks) {
          if (Array.isArray(service.networks)) {
            networks = service.networks;
            service.networks.forEach(n => networksUsed.add(n));
          }
        }

        // Calculate position based on level
        const level = levels[serviceName];
        const nodesAtLevel = levelGroups[level];
        const indexInLevel = nodesAtLevel.indexOf(serviceName);
        const totalWidthAtLevel = nodesAtLevel.length * nodeWidth + (nodesAtLevel.length - 1) * horizontalGap;
        const startX = 400 - totalWidthAtLevel / 2;
        
        // Y position: level 0 at bottom, higher levels above
        const x = startX + indexInLevel * (nodeWidth + horizontalGap);
        const y = 100 + (maxLevel - level) * (nodeHeight + verticalGap);

        const node: Node<ServiceConfig> = {
          id: nodeId,
          type: 'service',
          position: { x, y },
          data: {
            id: nodeId,
            type: detectedType,
            name: serviceName,
            containerName: service.container_name || serviceName,
            image: imageName,
            build: buildConfig,
            ports: service.ports || [],
            environment,
            volumes: service.volumes || [],
            dependsOn: [],
            dependsOnConditions,
            command: service.command,
            healthcheck: service.healthcheck as HealthcheckConfig | undefined,
            networks,
            restart: service.restart,
          },
        };

        nodes.push(node);
      });

      // Create edges from depends_on (source depends on target, so arrow from source to target)
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
