import React, { useState } from 'react';
import { 
  Server, 
  Terminal, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Cpu, 
  Boxes,
  Zap,
  CheckCircle2,
  HardDrive
} from 'lucide-react';

export const DeployGuide: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://your-vps-ip:3000';

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">How to Host on Your Linux VPS or Railway</h2>
            <p className="text-xs text-slate-400">
              This application is bundled with an Express + Vite server and runs standalone with standard Node.js 18+.
            </p>
          </div>
        </div>

        {/* VPS / Vercel / Railway Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Option A: Vercel */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-bold text-slate-200">1. Deploy on Vercel</span>
                </div>
                <button
                  onClick={() =>
                    handleCopy(
                      'vercel',
                      `# 1. Push your code to your remote repo\n# 2. Go to vercel.com/new and import the project\n# 3. Framework Preset: Vite\n# 4. Build Command: npm run build\n# 5. Output Directory: dist\n# 6. Click Deploy!`
                    )
                  }
                  className="text-emerald-400 hover:text-emerald-300 text-xs flex items-center gap-1"
                >
                  {copiedId === 'vercel' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy Steps
                </button>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Import your project repository directly into Vercel with one click.
              </p>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg">
                  <span className="text-slate-500 block text-[10px]">FRAMEWORK:</span>
                  <span className="text-emerald-300 font-semibold">Vite</span>
                </div>
                <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg">
                  <span className="text-slate-500 block text-[10px]">OUTPUT DIRECTORY:</span>
                  <span className="text-emerald-300 font-semibold">dist</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-[11px] text-slate-400">
              ⚡ <span className="text-slate-300 font-semibold">Vercel Config:</span> Pre-configured with <code className="text-emerald-400">vercel.json</code> rewrites!
            </div>
          </div>

          {/* Option B: Linux VPS */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-bold text-slate-200">2. Linux VPS (Ubuntu)</span>
                </div>
                <button
                  onClick={() =>
                    handleCopy(
                      'vps',
                      `# 1. Clone repository to VPS\ngit clone <YOUR_REPO_URL> clouddrive\ncd clouddrive\n\n# 2. Install dependencies & build\nnpm install\nnpm run build\n\n# 3. Run with PM2 on port 3000\nnpm install -g pm2\npm2 start dist/server.cjs --name "clouddrive"\npm2 save\npm2 startup`
                    )
                  }
                  className="text-cyan-400 hover:text-cyan-300 text-xs flex items-center gap-1"
                >
                  {copiedId === 'vps' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy Commands
                </button>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Run the production bundle using <code className="text-cyan-300">pm2</code> to keep it active 24/7.
              </p>

              <pre className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-[11px] font-mono text-cyan-300 overflow-x-auto">
{`git clone <REPO_URL>
npm install && npm run build
pm2 start dist/server.cjs`}
              </pre>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-[11px] text-slate-400">
              💡 <span className="text-slate-300 font-semibold">Reverse Proxy:</span> Nginx to port 3000 with SSL.
            </div>
          </div>

          {/* Option C: Railway / Render */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-bold text-slate-200">3. Railway.app</span>
                </div>
                <button
                  onClick={() =>
                    handleCopy(
                      'railway',
                      `Build Command: npm run build\nStart Command: node dist/server.cjs\nPORT: 3000`
                    )
                  }
                  className="text-purple-400 hover:text-purple-300 text-xs flex items-center gap-1"
                >
                  {copiedId === 'railway' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy Config
                </button>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Connect your repository to Railway and set the build/start commands:
              </p>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg">
                  <span className="text-slate-500 block text-[10px]">BUILD:</span>
                  <span className="text-purple-300">npm run build</span>
                </div>
                <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg">
                  <span className="text-slate-500 block text-[10px]">START:</span>
                  <span className="text-purple-300">node dist/server.cjs</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-[11px] text-slate-400">
              🚀 <span className="text-slate-300 font-semibold">Production Ready:</span> Full stack deployment.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
