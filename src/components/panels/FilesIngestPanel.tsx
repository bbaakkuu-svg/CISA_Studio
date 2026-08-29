import React from 'react';
import { 
  FolderOpen, 
  ArrowRight, 
  Sparkles, 
  FileText, 
  Image as ImageIcon, 
  FileSpreadsheet, 
  FileCode, 
  Trash2, 
  Clipboard,
  UploadCloud
} from 'lucide-react';
import { TaskFileItem, FileRole } from '../../types';
import { formatBytes } from '../../utils/formatters';

interface FilesIngestPanelProps {
  title: string;
  onChangeTitle: (title: string) => void;
  directPrompt: string;
  onChangeDirectPrompt: (text: string) => void;
  files: TaskFileItem[];
  onAddFiles: (newFiles: TaskFileItem[]) => void;
  onRemoveFile: (fileId: string) => void;
  onChangeRole: (fileId: string, role: FileRole) => void;
  onLoadDemo: () => void;
  onNext: () => void;
}

export const FilesIngestPanel: React.FC<FilesIngestPanelProps> = ({
  title,
  onChangeTitle,
  directPrompt,
  onChangeDirectPrompt,
  files,
  onAddFiles,
  onRemoveFile,
  onChangeRole,
  onLoadDemo,
  onNext
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processNativeFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processNativeFiles(Array.from(e.target.files));
    }
  };

  const processNativeFiles = (nativeFiles: File[]) => {
    const parsed: TaskFileItem[] = nativeFiles.map((file) => {
      const isImg = file.type.startsWith('image/');
      const isRubricHint = file.name.toLowerCase().includes('rubrica') || file.name.toLowerCase().includes('criterio');
      return {
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        role: isRubricHint ? 'rubric' : 'statement',
        previewUrl: isImg ? URL.createObjectURL(file) : undefined,
        fileObject: file
      };
    });
    onAddFiles(parsed);
  };

  const handlePasteClipboard = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      const newItems: TaskFileItem[] = [];

      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type);
            const previewUrl = URL.createObjectURL(blob);
            newItems.push({
              id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              name: `Captura_OCR_${new Date().toLocaleTimeString().replace(/:/g, '-')}.png`,
              size: blob.size,
              type: type,
              role: 'statement',
              previewUrl
            });
          }
        }
      }

      if (newItems.length > 0) {
        onAddFiles(newItems);
      } else {
        const text = await navigator.clipboard.readText();
        if (text) {
          onChangeDirectPrompt(directPrompt ? `${directPrompt}\n\n${text}` : text);
        }
      }
    } catch (e) {
      console.warn('Clipboard access restricted:', e);
    }
  };

  const getFileIcon = (file: TaskFileItem) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="w-4 h-4 text-sky-400" />;
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.csv')) return <FileSpreadsheet className="w-4 h-4 text-emerald-400" />;
    if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) return <FileText className="w-4 h-4 text-indigo-400" />;
    return <FileCode className="w-4 h-4 text-slate-300" />;
  };

  return (
    <div className="space-y-6">
      
      {/* Cabecera del Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-sky-400" />
            <span>1. Ingesta de Archivos & Enunciado</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Sube el enunciado de la tarea en PDF, Word, Excel, imagen o escribe las instrucciones.
          </p>
        </div>

        <button
          type="button"
          onClick={onLoadDemo}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-sky-300 text-xs font-medium border border-slate-800 hover:border-slate-700 transition-colors self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>Cargar Ejemplo</span>
        </button>
      </div>

      {/* Título de la Tarea */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          Título o Asignatura
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onChangeTitle(e.target.value)}
          placeholder="Ej: Análisis de Sistemas Distribuidos / Auditoría Financiera"
          className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium"
        />
      </div>

      {/* Dropzone Limpio */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border border-dashed rounded-2xl p-7 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-sky-400 bg-sky-500/10'
            : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-900/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.txt,.png,.jpg,.jpeg,.webp"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
            <UploadCloud className="w-5 h-5 text-sky-400" />
          </div>
          <p className="text-xs sm:text-sm text-slate-200 font-medium">
            Arrastra tus archivos aquí o <span className="text-sky-400 underline">explora</span>
          </p>
          <p className="text-[11px] text-slate-400">
            PDF, Word (.docx), Excel (.xlsx), CSV, Texto o Capturas de pantalla
          </p>
        </div>
      </div>

      {/* Botón rápido Pegar Captura (Ctrl+V) */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handlePasteClipboard}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-colors"
        >
          <Clipboard className="w-3.5 h-3.5 text-slate-400" />
          <span>Pegar desde Portapapeles (Ctrl+V)</span>
        </button>
        <span className="text-[11px] text-slate-400">
          {files.length} {files.length === 1 ? 'archivo adjunto' : 'archivos adjuntos'}
        </span>
      </div>

      {/* Lista Compacta de Archivos */}
      {files.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-300 block">
            Archivos Adjuntos
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                  {getFileIcon(file)}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-200 truncate">{file.name}</p>
                    <p className="text-[10px] text-slate-400">{formatBytes(file.size)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <select
                    value={file.role}
                    onChange={(e) => onChangeRole(file.id, e.target.value as FileRole)}
                    className="bg-slate-950 border border-slate-800 rounded-md px-2 py-1 text-[10px] text-slate-300 focus:outline-none focus:border-sky-500"
                  >
                    <option value="statement">Enunciado</option>
                    <option value="rubric">Rúbrica</option>
                  </select>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFile(file.id);
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instrucciones Directas / Texto */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          Instrucciones o Enunciado en Texto (Opcional)
        </label>
        <textarea
          rows={3}
          value={directPrompt}
          onChange={(e) => onChangeDirectPrompt(e.target.value)}
          placeholder="Pega aquí el texto del enunciado, requisitos especiales o comentarios del docente..."
          className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-normal resize-none"
        />
      </div>

      {/* Botón Siguiente */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm transition-all duration-150 active:scale-95 shadow-sm"
        >
          <span>Continuar a Rúbricas</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
