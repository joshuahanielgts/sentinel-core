import { useState, useCallback } from 'react'
import { useUploadContract } from '@/hooks/useContracts'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Upload, FileText } from 'lucide-react'

interface UploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

export default function UploadDialog({ open, onOpenChange }: UploadDialogProps) {
  const { workspace } = useWorkspace()
  const uploadContract = useUploadContract()
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState('')

  function resetState() {
    setFile(null)
    setName('')
    setError('')
    setDragActive(false)
  }

  function handleFile(f: File) {
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setError('Only PDF and DOCX files are accepted.')
      return
    }
    if (f.size > 25 * 1024 * 1024) {
      setError('File must be smaller than 25 MB.')
      return
    }
    setError('')
    setFile(f)
    if (!name) {
      setName(f.name.replace(/\.[^.]+$/, ''))
    }
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [name])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !workspace) return
    setError('')
    try {
      await uploadContract.mutateAsync({ file, name, workspaceId: workspace.id })
      resetState()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetState()
        onOpenChange(v)
      }}
    >
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Upload Contract</DialogTitle>
            <DialogDescription>Upload a PDF or DOCX file (max 25 MB).</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
            )}

            <div
              className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
                dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
              onDragLeave={() => setDragActive(false)}
              onDrop={onDrop}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              {file ? (
                <>
                  <FileText className="mb-2 h-8 w-8 text-primary" />
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </>
              ) : (
                <>
                  <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Drag and drop or click to select
                  </p>
                  <p className="text-xs text-muted-foreground">PDF, DOCX up to 25 MB</p>
                </>
              )}
            </div>

            <input
              id="file-input"
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleFile(f)
              }}
            />

            <div className="space-y-2">
              <Label htmlFor="contract-name">Contract Name</Label>
              <Input
                id="contract-name"
                placeholder="e.g. Vendor Agreement 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={!file || uploadContract.isPending}>
              {uploadContract.isPending ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
