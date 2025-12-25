import { useCallback } from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Trash2, Copy, Edit, Unlink } from 'lucide-react';

interface NodeContextMenuProps {
  children: React.ReactNode;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}

export function NodeContextMenu({
  children,
  onEdit,
  onDuplicate,
  onDelete,
}: NodeContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={onEdit} className="gap-2 cursor-pointer">
          <Edit className="w-4 h-4" />
          编辑配置
        </ContextMenuItem>
        <ContextMenuItem onClick={onDuplicate} className="gap-2 cursor-pointer">
          <Copy className="w-4 h-4" />
          复制节点
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={onDelete}
          className="gap-2 cursor-pointer text-destructive focus:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
          删除节点
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

interface EdgeContextMenuProps {
  x: number;
  y: number;
  onDelete: () => void;
  onClose: () => void;
}

export function EdgeContextMenu({ x, y, onDelete, onClose }: EdgeContextMenuProps) {
  const handleDelete = useCallback(() => {
    onDelete();
    onClose();
  }, [onDelete, onClose]);

  return (
    <div
      className="fixed z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={handleDelete}
        className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none gap-2 text-destructive hover:bg-accent hover:text-destructive"
      >
        <Unlink className="w-4 h-4" />
        删除连线
      </button>
    </div>
  );
}
