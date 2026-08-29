import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Image, FileSpreadsheet, Trash2, Tag, Plus, Clipboard, CheckCircle2 } from 'lucide-react';
import { TaskFileItem, FileRole } from '../../types';

interface UniversalDropzoneProps {
  files: TaskFileItem[];
  onAddFiles: (newFiles: TaskFileItem[]) => void;
  onRemoveFile: (fileId: string) => void;
  onChangeRole: (fileId: string, role: FileRole) => void;
  directPrompt: string;
  onChangeDirectPrompt: (text: string) => void;
}

export const UniversalDropzone: React.FC<UniversalDropzoneProps> = ({
  files,
  onAddFiles,
  onRemoveFile,
  onChangeRole,
  directPrompt,
  onChangeDirectPrompt
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
              name: `Captura_Portapapeles_${new Date().toLocaleTimeString().replace(/:/g, '-')}.png`,
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
        // Si no es imagen, intentar leer texto
        const text = await navigator.clipboard.readText();
        if (text) {
          onChangeDirectPrompt(directPrompt ? `${directPrompt}\n\n${text}` : text);
        }
      }
    } catch (e) {
      console.warn('Acceso al portapapeles no concedido:', e);
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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (file: TaskFileItem) => {
    if (file.type.startsWith('image/')) return <Image className="w-5 h-5 text-cyan-400" />;
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.csv') || file.name.endsWith('.xls')) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
    }
    return <FileText className="w-5 h-5 text-sky-400" />;
  };

  return (
    <div className="space-y-4">
      
      {/* Zona de Dropzone Principal */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragging 
            ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]' 
            : 'border-slate-700/80 hover:border-cyan-500/50 hover:bg-slate-900/40 bg-slate-950/40'
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

        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-sky-500/10 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
            <UploadCloud className="w-7 h-7 animate-pulse" />
          </div>

          <div>
            <p className="text-base sm:text-lg font-bold text-slate-100">
              Arrastra o haz clic para subir tus archivos
            </p>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
              PDF, Word (.docx), Excel (.xlsx/.csv), Texto o Capturas de pantalla (OCR Vision).
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            <span className="text-[11px] px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700">
              📄 Documentos
            </span>
            <span className="text-[11px] px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700">
              📊 Hojas de Cálculo
            </span>
            <span className="text-[11px] px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700">
              📸 Capturas & Fotos
            </span>
          </div>
        </div>
      </div>

      {/* Botón rápido para Pegar desde Portapapeles */}
      <div className="flex items-center justify-between gap-3 px-1">
        <span className="text-xs text-slate-400">
          ¿Tienes una captura o texto copiado?
        </span>
        <button
          type="button"
          onClick={handlePasteClipboard}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 border border-slate-700 hover:border-cyan-500/40 transition-all active:scale-95"
        >
          <Clipboard className="w-3.5 h-3.5" />
          <span>Pegar desde Portapapeles (Ctrl+V)</span>
        </button>
      </div>

      {/* Lista de Archivos Adjuntos */}
      {files.length > 0 && (
        <div className="space-y-2 mt-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Archivos Adjuntos ({files.length})
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {file.previewUrl ? (
                    <img
                      src={file.previewUrl}
                      alt={file.name}
                      className="w-10 h-10 rounded-lg object-cover border border-slate-700 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                      {getFileIcon(file)}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate max-w-[160px] sm:max-w-[180px]">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Selector de Rol */}
                  <select
                    value={file.role}
                    onChange={(e) => onChangeRole(file.id, e.target.value as FileRole)}
                    className="text-[11px] font-medium bg-slate-800 text-slate-200 rounded-lg px-2 py-1 border border-slate-700 focus:border-cyan-500 outline-none"
                  >
                    <option value="statement">Enunciado</option>
                    <option value="rubric">Rúbrica</option>
                    <option value="supporting_data">Datos/Anexo</option>
                  </select>

                  <button
                    onClick={() => onRemoveFile(file.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor de Texto Libre para Enunciados Adicionales */}
      <div className="pt-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
          Enunciado o Instrucciones Adicionales del Docente
        </label>
        <textarea
          rows={3}
          value={directPrompt}
          onChange={(e) => onChangeDirectPrompt(e.target.value)}
          placeholder="Escribe o pega aquí el enunciado de la tarea, requerimientos especiales, formato deseado o dudas puntuales..."
          className="w-full glass-input rounded-xl p-3 text-xs sm:text-sm resize-y"
        />
      </div>

    </div>
  );
};
