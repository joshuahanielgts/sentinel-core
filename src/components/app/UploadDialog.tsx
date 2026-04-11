import { useState, useCallback, useRef } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUploadContract } from '@/hooks/useContracts';
import { toast } from 'sonner';
import { formatFileSize } from '@/lib/utils';

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
}

const MAX_SIZE = 25 * 1024 * 1024;
const ACCEPTED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export function UploadDialog({ open, onOpenChange, workspaceId }: UploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadContract();

  const validateFile = (f: File): string | null => {
    if (!ACCEPTED_TYPES.includes(f.type)) return 'Only PDF and DOCX files are accepted.';
    if (f.size > MAX_SIZE) return 'File exceeds 25MB limit.';
    return null;
  };

  const handleFile = (f: File) => {
    const error = validateFile(f);
    if (error) {
      toast.error(error);
      return;
    }
    setFile(f);
    if (!name) setName(f.name.replace(/\.(pdf|docx)$/i, ''));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [name]);

  const handleSubmit = async () => {
    if (!file || !name.trim()) return;
    try {
      await upload.mutateAsync({ workspaceId, file, name: name.trim() });
      toast.success('Contract uploaded successfully');
      setFile(null);
      setName('');
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-mono text-foreground">UPLOAD CONTRACT</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-primary bg-primary/5 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                : 'border-border hover:border-primary/40'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-8 h-8 text-primary" />
                <div className="text-left">
                  <p className="font-mono text-sm text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{formatFileSize(file.size)}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-mono text-sm text-foreground">
                  {isDragging ? 'DROP TO UPLOAD' : 'DROP FILE HERE OR CLICK TO BROWSE'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">PDF / DOCX • Max 25MB</p>
              </>
            )}
          </div>

          {/* Name input */}
          <div className="space-y-2">
            <Label className="font-mono text-xs text-muted-foreground">CONTRACT NAME</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter contract name..."
              className="bg-background font-mono text-sm"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!file || !name.trim() || upload.isPending}
            className="w-full btn-glow font-mono"
          >
            {upload.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                UPLOADING...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                UPLOAD CONTRACT
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
