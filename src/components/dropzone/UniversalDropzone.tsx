import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Image as ImageIcon, 
  FileSpreadsheet, 
  Trash2, 
  Clipboard, 
  Sparkles, 
  Eye, 
  CheckCircle2, 
  Sliders,
  ScanLine,
  FileCode
} from 'lucide-react';
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
  const [activePreviewUrl, setActivePreviewUrl] = useState<string | null>(null);
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
      console.warn('Acceso al portapapeles restringido:', e);
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
    if (file.type.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-cyan-400" />;
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.csv') || file.name.endsWith('.xls')) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
    }
    if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
      return <FileText className="w-5 h-5 text-sky-400" />;
    }
    return <FileCode className="w-5 h-5 text-indigo-400" />;
  };

  return (
    <div className="space-y-4">
      
      {/* Zona de Dropzone Futurista */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group overflow-hidden border-2 border-dashed rounded-2xl p-6 sm:p-9 text-center cursor-pointer transition-all duration-300 ${
          isDragging 
            ? 'border-cyan-400 bg-cyan-500/15 scale-[1.01] shadow-2xl shadow-cyan-500/30' 
            : 'border-slate-800 hover:border-cyan-500/50 bg-slate-950/60 hover:bg-slate-900/50 shadow-inner'
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

        {/* Efecto de luz ambiental */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-cyan-500/20 blur-3xl pointer-events-none group-hover:bg-cyan-500/30 transition-all" />

        <div className="relative flex flex-col items-center justify-center gap-3.5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-sky-500/10 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-xl group-hover:scale-110 group-hover:border-cyan-400 transition-all duration-300">
            <ScanLine className="w-8 h-8 group-hover:animate-pulse" />
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-100 group-hover:text-cyan-300 transition-colors">
              Arrastra o selecciona tus archivos de tarea
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
              PDF, Word (.docx), Excel (.xlsx/.csv), Código o Capturas con OCR Inteligente.
            </p>
          </div>

          {/* Badges de Formatos Aceptados */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
            <span className="text-[11px] font-semibold px-3 py-1 rounded-lg bg-slate-900/90 text-cyan-300 border border-slate-700/80 shadow-sm">
              📄 Enunciados PDF/Word
            </span>
            <span className="text-[11px] font-semibold px-3 py-1 rounded-lg bg-slate-900/90 text-emerald-300 border border-slate-700/80 shadow-sm">
              📊 Tablas & Datos Excel
            </span>
            <span className="text-[11px] font-semibold px-3 py-1 rounded-lg bg-slate-900/90 text-indigo-300 border border-slate-700/80 shadow-sm">
              📸 Capturas & Fotos OCR
            </span>
          </div>
        </div>
      </div>

      {/* Barra Rápida de Captura & Portapapeles */}
      <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
        <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>¿Tienes una captura o texto copiado en el portapapeles?</span>
        </span>
        <button
          type="button"
          onClick={handlePasteClipboard}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-xs font-bold text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 transition-all active:scale-95 whitespace-nowrap"
        >
          <Clipboard className="w-3.5 h-3.5" />
          <span>Pegar Captura (Ctrl+V)</span>
        </button>
      </div>

      {/* Grid de Archivos Cargados (Tarjetas Interactivas) */}
      {files.length > 0 && (
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
              Archivos en Workspace ({files.length})
            </span>
            <span className="text-[11px] text-slate-500">
              Asigna el rol para que la IA entienda cada archivo
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="group relative p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all shadow-md flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {file.previewUrl ? (
                    <div 
                      onClick={() => setActivePreviewUrl(file.previewUrl!)}
                      className="relative w-11 h-11 rounded-lg overflow-hidden border border-slate-700 flex-shrink-0 cursor-pointer group-hover:border-cyan-400"
                    >
                      <img
                        src={file.previewUrl}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Eye className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                      {getFileIcon(file)}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-200 truncate max-w-[150px] sm:max-w-[170px] group-hover:text-cyan-300 transition-colors">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Selector de Rol Dinámico */}
                  <select
                    value={file.role}
                    onChange={(e) => onChangeRole(file.id, e.target.value as FileRole)}
                    className="text-[11px] font-bold bg-slate-950 text-cyan-300 rounded-lg px-2.5 py-1.5 border border-slate-700 focus:border-cyan-400 outline-none"
                  >
                    <option value="statement">📄 Enunciado</option>
                    <option value="rubric">⚖️ Rúbrica</option>
                    <option value="supporting_data">📊 Datos</option>
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

      {/* Editor de Instrucciones Adicionales */}
      <div className="pt-2">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5 px-1 flex items-center justify-between">
          <span>Instrucciones o Enunciado Directo</span>
          <span className="text-[10px] text-slate-500 font-normal">Opcional si subiste archivo</span>
        </label>
        <textarea
          rows={3}
          value={directPrompt}
          onChange={(e) => onChangeDirectPrompt(e.target.value)}
          placeholder="Escribe o pega aquí el enunciado de la tarea, requerimientos especiales del profesor o normas a seguir..."
          className="w-full glass-input rounded-xl p-3.5 text-xs sm:text-sm resize-y leading-relaxed font-sans placeholder:text-slate-500"
        />
      </div>

      {/* Modal de Previsualización de Imagen / Captura */}
      {activePreviewUrl && (
        <div 
          onClick={() => setActivePreviewUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md cursor-pointer animate-fade-in"
        >
          <div className="max-w-2xl max-h-[85vh] rounded-2xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-900">
            <img src={activePreviewUrl} alt="Vista Previa OCR" className="w-full h-full object-contain" />
          </div>
        </div>
      )}

    </div>
  );
};
