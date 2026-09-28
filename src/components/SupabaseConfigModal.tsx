import React, { useState } from 'react';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  GENERATE_SUPABASE_SQL_SCRIPT
} from '../services/supabase';
import { purgeAllMockData, getStoredMeetings, saveMeeting } from '../services/storage';
import { showSuccessToast, showDeleteConfirm } from '../utils/alerts';
import {
  Database,
  ShieldCheck,
  Globe,
  Copy,
  Check,
  ExternalLink,
  Lock,
  FileCode,
  Sparkles,
  Server,
  RefreshCw,
  Trash2,
  X
} from 'lucide-react';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReset?: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onDataReset,
}) => {
  const [config, setConfig] = useState(getSupabaseConfig());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'config' | 'sql' | 'github' | 'seo'>('config');
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedWorkflow, setCopiedWorkflow] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  if (!isOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    const result = await testSupabaseConnection(config.supabaseUrl, config.supabaseAnonKey);
    setTestResult(result);
    setTesting(false);

    if (result.success) {
      saveSupabaseConfig({
        ...config,
        isConnected: true
      });
      showSuccessToast('เชื่อมต่อสำเร็จ', 'บันทึกการตั้งค่า Supabase เรียบร้อยแล้ว');
    }
  };

  const handleResetAllMockData = async () => {
    const confirmed = await showDeleteConfirm('ข้อมูลจำลองทั้งหมด เพื่อรีเซ็ตเป็นระบบว่างพร้อมบันทึกจริง');
    if (confirmed) {
      setIsResetting(true);
      purgeAllMockData();
      showSuccessToast('ล้างข้อมูลสำเร็จ', 'ข้อมูลจำลองทั้งหมดถูกนำออกแล้ว ระบบพร้อมสำหรับการบันทึกจริง');
      setIsResetting(false);
      if (onDataReset) {
        onDataReset();
      }
      setTimeout(() => {
        window.location.reload();
      }, 800);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(GENERATE_SUPABASE_SQL_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const githubWorkflowCode = `name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Install dependencies
        run: npm install --legacy-peer-deps

      - name: Build project with Vite
        env:
          VITE_SUPABASE_URL: \${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: \${{ secrets.VITE_SUPABASE_ANON_KEY }}
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                Tetapan Supabase, Keselamatan RLS & GitHub Pages
              </h2>
              <p className="text-xs text-slate-400">
                Kawalan hak akses berhierarki kerajaan dan persediaan sedia untuk pengeluaran secara selamat
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium overflow-x-auto">
          <button
            onClick={() => setActiveTab('config')}
            className={`px-3.5 py-2.5 rounded-t-xl border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'config'
                ? 'border-blue-600 text-blue-700 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server className="w-4 h-4" />
            Sambungan Supabase
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3.5 py-2.5 rounded-t-xl border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'border-blue-600 text-blue-700 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-4 h-4" />
            Skrip SQL & Row Level Security (RLS)
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`px-3.5 py-2.5 rounded-t-xl border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'github'
                ? 'border-blue-600 text-blue-700 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-4 h-4" />
            Penyebaran GitHub Pages
          </button>

          <button
            onClick={() => setActiveTab('seo')}
            className={`px-3.5 py-2.5 rounded-t-xl border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'seo'
                ? 'border-blue-600 text-blue-700 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Carian Google (SEO)
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'config' && (
            <div className="space-y-5">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 space-y-1">
                <p className="font-semibold flex items-center gap-1.5 text-blue-800">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Sistem Menyokong Kedua-dua Supabase Cloud dan Enjin Simpanan Tempatan Selamat
                </p>
                <p className="leading-relaxed">
                  Sekiranya Supabase URL belum diisi, sistem beroperasi secara penuh menggunakan Enjin Penyimpanan Tempatan Berterusan (Persistent Engine).
                  Apabila Project URL dan Anon Key dimasukkan, data akan diselaraskan ke pangkalan data PostgreSQL secara automatik mengikut polisi RLS.
                </p>
              </div>

              <form onSubmit={handleTestAndSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Supabase Project URL <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://xyzproject.supabase.co"
                    value={config.supabaseUrl}
                    onChange={(e) => setConfig({ ...config, supabaseUrl: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Boleh didapati di Supabase Dashboard &gt; Project Settings &gt; API &gt; Project URL
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Supabase Anon Public API Key <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={config.supabaseAnonKey}
                    onChange={(e) => setConfig({ ...config, supabaseAnonKey: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Gunakan kekunci `anon` `public` sahaja (DILARANG menggunakan service_role di web frontend demi keselamatan)
                  </p>
                </div>

                {testResult && (
                  <div
                    className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                      testResult.success
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}
                  >
                    {testResult.success ? (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Lock className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={testing}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    {testing ? 'กำลังทดสอบการเชื่อมต่อ...' : 'ทดสอบและบันทึกการเชื่อมต่อ (Test & Save)'}
                  </button>
                </div>
              </form>

              {/* Data Management & Mock Purge Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-3 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Trash2 className="w-4 h-4 text-rose-600" />
                      จัดการข้อมูลและการล้างข้อมูลจำลอง (Clear Mock Data)
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      ล้างข้อมูลการประชุมและคณะกรรมการจำลองทั้งหมด เพื่อให้เหลือข้อมูลจริงที่เป็นค่าว่าง พร้อมสำหรับการบันทึกจริง
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetAllMockData}
                    disabled={isResetting}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isResetting ? 'กำลังล้างข้อมูล...' : 'ล้างข้อมูลจำลองทั้งหมด (Reset to Blank)'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Struktur Jadual dan Polisi Keselamatan RLS (PostgreSQL Schema)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Salin arahan SQL ini ke dalam Supabase SQL Editor untuk membina jadual dan mengaktifkan Row-Level Security
                  </p>
                </div>

                <button
                  onClick={handleCopySql}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Berjaya Disalin!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Salin Semua Kod SQL
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-[380px] border border-slate-800">
                <pre>{GENERATE_SUPABASE_SQL_SCRIPT}</pre>
              </div>
            </div>
          )}

          {activeTab === 'github' && (
            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
                <p className="font-semibold text-emerald-800 mb-1">
                  Langkah-Langkah Deploy ke GitHub Pages Secara Selamat 100%
                </p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Bina GitHub Repository baharu dan Push keseluruhan kod sumber aplikasi ke cawangan utama</li>
                  <li>Pergi ke tab <strong>Settings &gt; Pages</strong> di GitHub dan pilih Source sebagai <strong>GitHub Actions</strong></li>
                  <li>Pergi ke <strong>Settings &gt; Secrets and variables &gt; Actions</strong> dan masukkan dua Secrets berikut:
                    <ul className="list-disc pl-5 mt-1 font-mono text-[11px]">
                      <li>VITE_SUPABASE_URL</li>
                      <li>VITE_SUPABASE_ANON_KEY</li>
                    </ul>
                  </li>
                  <li>Cipta fail aliran kerja <code>.github/workflows/deploy.yml</code> menggunakan kod di bawah</li>
                </ol>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="font-bold text-slate-800">Contoh Fail Aliran Kerja GitHub Actions (Workflow):</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(githubWorkflowCode);
                    setCopiedWorkflow(true);
                    setTimeout(() => setCopiedWorkflow(false), 2000);
                  }}
                  className="px-3 py-1 bg-slate-800 text-white rounded-lg text-xs font-medium cursor-pointer"
                >
                  {copiedWorkflow ? 'Berjaya Disalin' : 'Salin YAML'}
                </button>
              </div>

              <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-[220px]">
                <pre>{githubWorkflowCode}</pre>
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-purple-900">
                <p className="font-semibold text-purple-800 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Pengindeksan dan Keterlihatan pada Enjin Carian Google (Google SEO)
                </p>
                <p>
                  Sistem telah dikonfigurasikan dengan teg meta SEO lengkap, OpenGraph Cards, dan Schema.org WebApplication (JSON-LD) yang mematuhi garis panduan pengindeksan carian Google:
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">Title:</span>
                  <span className="text-slate-600">Sistem Pengurusan & Minit Mesyuarat Rasmi | e-Mesyuarat Zone</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">Keywords:</span>
                  <span className="text-slate-600">sistem minit mesyuarat, kehadiran kuorum, mesyuarat zone, pengurusan mukim, daerah, negeri, e-mesyuarat, minit mesyuarat pdf</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">Structured Data:</span>
                  <span className="text-emerald-700 font-mono">Schema.org @type "WebApplication" (ms)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
