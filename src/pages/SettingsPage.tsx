import React from 'react';
import { Download, Upload, Share2, Info } from 'lucide-react';
import { Product } from '../lib/utils';

interface SettingsPageProps {
  inventory: Product[];
  onImport: (data: Product[]) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ inventory, onImport }) => {
  const exportData = () => {
    const blob = new Blob([JSON.stringify(inventory, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_${new Date().getTime()}.json`;
    a.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (Array.isArray(data)) {
          onImport(data);
          alert('导入成功');
        }
      } catch (err) {
        alert('导入失败，请检查文件格式');
      }
    };
    reader.readAsText(file);
  };

  const shareData = async () => {
    if (navigator.share) {
      await navigator.share({ title: '库存备份', text: JSON.stringify(inventory) });
    } else {
      navigator.clipboard.writeText(JSON.stringify(inventory));
      alert('数据已复制到剪贴板');
    }
  };

  return (
    <div className="p-4 space-y-8">
      <section className="space-y-4">
        <h2 className="text-xs font-black text-neutral-400 uppercase tracking-widest">数据管理</h2>
        <div className="space-y-3">
          <SettingItem 
            icon={<Download className="text-blue-500" />} 
            title="导出 JSON 数据" 
            desc="下载本地库存备份文件" 
            onClick={exportData} 
          />
          <label className="block">
            <SettingItem 
              icon={<Upload className="text-emerald-500" />} 
              title="导入 JSON 数据" 
              desc="从备份文件恢复库存" 
              asLabel
            />
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
          <SettingItem 
            icon={<Share2 className="text-purple-500" />} 
            title="分享/发送" 
            desc="通过系统原生分享发送数据" 
            onClick={shareData} 
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xs font-black text-neutral-400 uppercase tracking-widest">系统信息</h2>
        <div className="bg-white p-6 rounded-[2rem] border border-neutral-100 flex items-start gap-4">
          <Info className="w-5 h-5 text-neutral-400 mt-1" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-neutral-800">扫码助手 v1.2.0</p>
            <p className="text-xs text-neutral-400 leading-relaxed">
              专为 AndroidIDE 封装设计的移动端 Web 应用。支持离线 JSON 存储，兼容 API 23+。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

function SettingItem({ icon, title, desc, onClick, asLabel }: any) {
  const Tag = asLabel ? 'div' : 'button';
  return (
    <Tag 
      onClick={onClick}
      className="w-full flex items-center gap-4 p-5 bg-white rounded-[2rem] border border-neutral-100 active:bg-neutral-50 transition-all text-left"
    >
      <div className="w-12 h-12 rounded-2xl bg-neutral-50 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="font-bold text-neutral-800">{title}</p>
        <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">{desc}</p>
      </div>
    </Tag>
  );
}
