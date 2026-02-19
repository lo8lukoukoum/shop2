import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Camera } from 'lucide-react';
import { Product } from '../lib/utils';

interface InventoryPageProps {
  inventory: Product[];
  onAdd: (p: Partial<Product>) => void;
  onDelete: (id: string) => void;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({ inventory, onAdd, onDelete }) => {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Partial<Product> | null>(null);

  const filtered = inventory.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search)
  );

  return (
    <div className="p-4 space-y-6">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input 
            type="text" 
            placeholder="搜索名称或条码..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-neutral-100 rounded-2xl text-sm focus:ring-2 focus:ring-neutral-900/5 outline-none transition-all"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setEditing({ barcode: '', name: '', price: 0, stock: 0 })}
          className="p-3 bg-neutral-900 text-white rounded-2xl shadow-lg active:scale-95 transition-all"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-3">
        {filtered.map(product => (
          <div key={product.id} className="bg-white p-4 rounded-2xl border border-neutral-100 flex items-center justify-between shadow-sm">
            <div className="flex-1">
              <h3 className="font-bold text-neutral-800">{product.name}</h3>
              <p className="text-[10px] text-neutral-400 font-mono tracking-tighter">{product.barcode}</p>
              <div className="flex gap-4 mt-2">
                <span className="text-sm font-black text-neutral-900">¥{product.price.toFixed(2)}</span>
                <span className="text-xs text-neutral-400">库存: {product.stock}</span>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setEditing(product)} className="p-2 text-neutral-300 hover:text-neutral-900 transition-colors">
                <Edit2 className="w-5 h-5" />
              </button>
              <button onClick={() => onDelete(product.id)} className="p-2 text-red-200 hover:text-red-500 transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="relative w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
            <h3 className="text-xl font-black">{editing.id ? '编辑商品' : '新增商品'}</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">条形码</label>
                <div className="flex gap-2">
                  <input 
                    className="flex-1 px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl outline-none"
                    value={editing.barcode}
                    onChange={e => setEditing({...editing, barcode: e.target.value})}
                  />
                  <button className="p-3 bg-neutral-100 rounded-xl text-neutral-500"><Camera className="w-5 h-5" /></button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">商品名称</label>
                <input 
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl outline-none"
                  value={editing.name}
                  onChange={e => setEditing({...editing, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">价格</label>
                  <input 
                    type="number"
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl outline-none"
                    value={editing.price}
                    onChange={e => setEditing({...editing, price: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">库存</label>
                  <input 
                    type="number"
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl outline-none"
                    value={editing.stock}
                    onChange={e => setEditing({...editing, stock: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <button 
                onClick={() => { onAdd(editing); setEditing(null); }}
                className="w-full py-4 bg-neutral-900 text-white rounded-2xl font-black shadow-xl active:scale-95 transition-all"
              >
                保存数据
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
