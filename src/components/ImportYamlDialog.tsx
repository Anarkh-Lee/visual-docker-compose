import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface ImportYamlDialogProps {
  onImport: (yamlContent: string) => void;
}

export function ImportYamlDialog({ onImport }: ImportYamlDialogProps) {
  const [open, setOpen] = useState(false);
  const [yamlContent, setYamlContent] = useState('');

  const handleImport = () => {
    if (!yamlContent.trim()) {
      toast.error('请输入 YAML 内容');
      return;
    }
    
    try {
      onImport(yamlContent);
      setYamlContent('');
      setOpen(false);
    } catch (error) {
      toast.error('导入失败，请检查 YAML 格式');
    }
  };

  const exampleYaml = `version: "3.8"
services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"
    depends_on:
      - api
  api:
    image: node:18-alpine
    ports:
      - "3000:3000"
    depends_on:
      - db
  db:
    image: mysql:8.0
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: root123`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Upload className="w-4 h-4" />
          导入 YAML
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>导入 Docker Compose</DialogTitle>
          <DialogDescription>
            粘贴现有的 docker-compose.yml 内容，系统将自动解析并生成画布节点
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            value={yamlContent}
            onChange={(e) => setYamlContent(e.target.value)}
            placeholder={exampleYaml}
            className="min-h-[300px] font-mono text-sm bg-secondary"
          />
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setYamlContent(exampleYaml)}
              className="text-xs"
            >
              加载示例
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button onClick={handleImport}>
            导入并生成
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
