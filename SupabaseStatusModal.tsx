import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Copy,
  Check,
  CloudUpload,
  CloudDownload,
  AlertTriangle,
  X,
  Code
} from 'lucide-react';
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SCHEMA_SQL,
  testSupabaseConnection,
  syncLocalDataToSupabase,
  fetchAtestadosFromSupabase,
  fetchUsersFromSupabase
} from '../lib/supabase';
import { getAtestados, getUsers } from '../utils/storage';
import { Atestado, User } from '../types';

interface SupabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataSynced: (atestados: Atestado[]) => void;
}

export const SupabaseStatusModal: React.FC<SupabaseStatusModalProps> = ({
  isOpen,
  onClose,
  onDataSynced,
}) => {
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [showSqlCode, setShowSqlCode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      handleTestConnection();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setStatus(null);
    setSyncFeedback(null);
    const result = await testSupabaseConnection();
    setStatus(result);
    setTesting(false);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(SUPABASE_URL);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(SUPABASE_ANON_KEY);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleUploadLocalToSupabase = async () => {
    setSyncing(true);
    setSyncFeedback(null);
    const localAtestados = getAtestados();
    const localUsers = getUsers();
    const result = await syncLocalDataToSupabase(localAtestados, localUsers);
    
    if (result.errors.length > 0 && result.atestadosSynced === 0) {
      setSyncFeedback(`Erro no envio ao Supabase. Verifique se as tabelas foram criadas com o script SQL.`);
    } else {
      setSyncFeedback(`Sincronização com Nuvem Concluída! ${result.atestadosSynced} atestado(s) e ${result.usersSynced} usuário(s) salvos no Supabase.`);
      // Atualizar lista local
      const updated = getAtestados();
      onDataSynced(updated);
    }
    setSyncing(false);
  };

  const handleDownloadFromSupabase = async () => {
    setSyncing(true);
    setSyncFeedback(null);
    const cloudAtestados = await fetchAtestadosFromSupabase();
    const cloudUsers = await fetchUsersFromSupabase();

    if (!cloudAtestados && !cloudUsers) {
      setSyncFeedback(`Não foi possível baixar dados do Supabase. Verifique se as tabelas existem.`);
    } else {
      if (cloudAtestados && cloudAtestados.length > 0) {
        localStorage.setItem('atestados_app_list_v1', JSON.stringify(cloudAtestados));
        onDataSynced(cloudAtestados);
      }
      if (cloudUsers && cloudUsers.length > 0) {
        localStorage.setItem('atestados_app_users_v1', JSON.stringify(cloudUsers));
      }
      setSyncFeedback(`Dados baixados com sucesso da nuvem Supabase! (${cloudAtestados?.length || 0} atestados encontrados)`);
    }
    setSyncing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full text-white overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900/40 via-slate-900 to-slate-900 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Integração Banco de Dados Supabase
              </h3>
              <p className="text-xs text-slate-400">
                Sincronização e armazenamento em nuvem em tempo real
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Credentials Display */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Credenciais Conectadas
            </h4>
            
            <div className="space-y-2">
              <div>
                <label className="text-xs text-slate-400 block mb-1">SUPABASE_URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={SUPABASE_URL}
                    className="w-full bg-slate-900 text-slate-200 text-xs px-3 py-2 rounded-lg border border-slate-700 font-mono"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors cursor-pointer"
                    title="Copiar URL"
                  >
                    {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">SUPABASE_ANON_KEY</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={SUPABASE_ANON_KEY}
                    className="w-full bg-slate-900 text-slate-200 text-xs px-3 py-2 rounded-lg border border-slate-700 font-mono"
                  />
                  <button
                    onClick={handleCopyKey}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors cursor-pointer"
                    title="Copiar Chave Anon"
                  >
                    {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Connection Status Box */}
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {testing ? (
                <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
              ) : status?.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              )}
              <div>
                <span className="text-xs font-semibold text-slate-300 block">
                  Status da Conexão
                </span>
                <p className="text-xs text-slate-400">
                  {testing
                    ? 'Testando comunicação com o servidor Supabase...'
                    : status?.message || 'Aguardando verificação...'}
                </p>
              </div>
            </div>

            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              Testar
            </button>
          </div>

          {/* Cloud Sync Actions */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Ações de Sincronização em Nuvem
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleUploadLocalToSupabase}
                disabled={syncing}
                className="p-3 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer text-left"
              >
                <CloudUpload className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold">Enviar Dados para o Supabase</div>
                  <div className="text-[11px] font-normal text-emerald-400/80">
                    Sincroniza registros locais na nuvem
                  </div>
                </div>
              </button>

              <button
                onClick={handleDownloadFromSupabase}
                disabled={syncing}
                className="p-3 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-300 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer text-left"
              >
                <CloudDownload className="w-5 h-5 text-blue-400 shrink-0" />
                <div>
                  <div className="font-bold">Baixar Dados do Supabase</div>
                  <div className="text-[11px] font-normal text-blue-400/80">
                    Carrega os atestados salvos na nuvem
                  </div>
                </div>
              </button>
            </div>

            {syncFeedback && (
              <div className="p-3 bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{syncFeedback}</span>
              </div>
            )}
          </div>

          {/* SQL Setup Script Toggle */}
          <div className="border-t border-slate-800 pt-4">
            <button
              onClick={() => setShowSqlCode(!showSqlCode)}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Code className="w-4 h-4" />
              {showSqlCode ? 'Ocultar Script SQL das Tabelas' : 'Ver Script SQL para criar tabelas no Supabase SQL Editor'}
            </button>

            {showSqlCode && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Copie e cole este código no SQL Editor do seu painel Supabase:
                  </span>
                  <button
                    onClick={handleCopySql}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedSql ? 'Copiado!' : 'Copiar SQL'}
                  </button>
                </div>
                <pre className="bg-slate-950 text-emerald-400 text-xs font-mono p-4 rounded-xl border border-slate-800 overflow-x-auto max-h-48">
                  {SUPABASE_SCHEMA_SQL}
                </pre>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
