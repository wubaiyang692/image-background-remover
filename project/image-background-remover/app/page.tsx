'use client';

import { useState, useCallback, useRef } from 'react';

type Status = 'idle' | 'loading' | 'done' | 'error';

export default function Home() {
  const [status, setStatus] = useState<Status>('idle');
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setErrorMsg('仅支持 JPG、PNG、WebP 格式');
      setStatus('error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('图片大小不能超过 10MB');
      setStatus('error');
      return;
    }

    setOriginalName(file.name);
    setOriginalUrl(URL.createObjectURL(file));
    setResultUrl(null);
    setStatus('loading');

    const form = new FormData();
    form.append('image', file);

    try {
      const res = await fetch('/api/remove-bg', { method: 'POST', body: form });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '处理失败');
      }
      const blob = await res.blob();
      setResultUrl(URL.createObjectURL(blob));
      setStatus('done');
    } catch (e: any) {
      setErrorMsg(e.message || '处理失败，请重试');
      setStatus('error');
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleReset = () => {
    setStatus('idle');
    setOriginalUrl(null);
    setResultUrl(null);
    setErrorMsg('');
    setOriginalName('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `removed-bg-${originalName.replace(/\.[^.]+$/, '')}.png`;
    a.click();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* Header */}
      <header className="py-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-3xl">✂️</span>
          <h1 className="text-3xl font-bold text-slate-800">背景去除工具</h1>
        </div>
        <p className="text-slate-500 text-base">上传图片，一键去除背景，免费下载透明 PNG</p>
      </header>

      <div className="flex-1 max-w-3xl mx-auto w-full px-4 pb-16 flex flex-col gap-8">
        {/* Upload Area */}
        {status === 'idle' && (
          <div
            className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-colors ${
              isDragging ? 'border-blue-400 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50'
            }`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <div className="text-5xl mb-4">🖼️</div>
            <p className="text-slate-600 text-lg font-medium mb-1">拖拽图片到这里，或点击选择</p>
            <p className="text-slate-400 text-sm">支持 JPG、PNG、WebP，最大 10MB</p>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}

        {/* Loading */}
        {status === 'loading' && (
          <div className="rounded-2xl bg-white shadow-sm p-16 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
            </div>
            <p className="text-slate-600 font-medium">正在去除背景，请稍候...</p>
            <p className="text-slate-400 text-sm mt-1">通常需要 3-10 秒</p>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-8 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-red-600 font-medium mb-4">{errorMsg}</p>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              重新上传
            </button>
          </div>
        )}

        {/* Result */}
        {status === 'done' && originalUrl && resultUrl && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl overflow-hidden bg-white shadow-sm">
                <div className="px-4 py-2 bg-slate-100 text-sm text-slate-500 font-medium">原图</div>
                <img src={originalUrl} alt="原图" className="w-full object-contain max-h-72" />
              </div>
              <div className="rounded-2xl overflow-hidden shadow-sm">
                <div className="px-4 py-2 bg-slate-100 text-sm text-slate-500 font-medium">去背景结果</div>
                <div
                  className="w-full max-h-72 flex items-center justify-center"
                  style={{
                    backgroundImage:
                      'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                    backgroundSize: '16px 16px',
                    backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                    backgroundColor: '#f0f0f0',
                  }}
                >
                  <img src={resultUrl} alt="去背景结果" className="w-full object-contain max-h-72" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={handleDownload}
                className="px-8 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors shadow-sm"
              >
                ⬇️ 下载透明 PNG
              </button>
              <button
                onClick={handleReset}
                className="px-8 py-3 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition-colors"
              >
                重新上传
              </button>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-slate-400 text-sm border-t border-slate-100">
        <p>图片仅用于处理，不存储、不记录 · 由 remove.bg 提供抠图能力</p>
      </footer>
    </main>
  );
}
