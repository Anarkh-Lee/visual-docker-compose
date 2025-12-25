import { useState } from 'react';
import { Copy, Download, Check, ChevronUp, ChevronDown, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface YamlPreviewProps {
  yaml: string;
  onDownload: () => void;
  onCopy: () => Promise<boolean>;
}

export function YamlPreview({ yaml, onDownload, onCopy }: YamlPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    const success = await onCopy();
    if (success) {
      setCopied(true);
      toast({
        title: '复制成功',
        description: 'YAML 内容已复制到剪贴板',
      });
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast({
        title: '复制失败',
        description: '无法访问剪贴板',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = () => {
    onDownload();
    toast({
      title: '下载成功',
      description: 'docker-compose.yml 已开始下载',
    });
  };

  const lineCount = yaml.split('\n').length;

  return (
    <div
      className={cn(
        'bg-code-bg border-t border-code-border flex flex-col transition-all duration-300',
        isExpanded ? 'h-72' : 'h-12'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-code-border bg-card/50">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
        >
          <FileCode className="w-4 h-4" />
          <span>docker-compose.yml</span>
          <span className="text-xs text-muted-foreground">
            ({lineCount} 行)
          </span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </button>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-8 text-xs"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 mr-1 text-accent" />
                已复制
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 mr-1" />
                复制 YAML
              </>
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="h-8 text-xs"
          >
            <Download className="w-3 h-3 mr-1" />
            下载 .yml
          </Button>
        </div>
      </div>
      
      {/* Code Area */}
      {isExpanded && (
        <div className="flex-1 overflow-auto">
          <div className="flex text-sm font-mono">
            {/* Line Numbers */}
            <div className="select-none px-4 py-3 text-right text-muted-foreground bg-code-bg/50 border-r border-code-border">
              {yaml.split('\n').map((_, index) => (
                <div key={index} className="leading-6">
                  {index + 1}
                </div>
              ))}
            </div>
            
            {/* Code Content */}
            <pre className="flex-1 px-4 py-3 overflow-x-auto">
              <code className="text-foreground leading-6">
                {yaml.split('\n').map((line, index) => (
                  <div key={index} className="whitespace-pre">
                    {highlightYaml(line)}
                  </div>
                ))}
              </code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple YAML syntax highlighting
function highlightYaml(line: string): React.ReactNode {
  // Comments
  if (line.trim().startsWith('#')) {
    return <span className="text-muted-foreground">{line}</span>;
  }

  // Key-value pairs
  const keyMatch = line.match(/^(\s*)([^:]+)(:)(.*)$/);
  if (keyMatch) {
    const [, indent, key, colon, value] = keyMatch;
    return (
      <>
        {indent}
        <span className="text-primary">{key}</span>
        <span className="text-muted-foreground">{colon}</span>
        {highlightValue(value)}
      </>
    );
  }

  // List items
  const listMatch = line.match(/^(\s*)(-)(\s*)(.*)$/);
  if (listMatch) {
    const [, indent, dash, space, value] = listMatch;
    return (
      <>
        {indent}
        <span className="text-accent">{dash}</span>
        {space}
        {highlightValue(value)}
      </>
    );
  }

  return line;
}

function highlightValue(value: string): React.ReactNode {
  if (!value || value.trim() === '') return value;

  // Quoted strings
  if (value.includes('"') || value.includes("'")) {
    return <span className="text-service-spring">{value}</span>;
  }

  // Numbers
  if (/^\s*\d+(\.\d+)?\s*$/.test(value)) {
    return <span className="text-service-mysql">{value}</span>;
  }

  return <span className="text-foreground">{value}</span>;
}
