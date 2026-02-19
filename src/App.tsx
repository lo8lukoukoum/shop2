import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, Settings, Plus, Trash2, Edit2, Download, Upload, Share2, Search, X, Camera, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Scanner } from './components/Scanner';
import { Product, OrderItem, getInventory, saveInventory, cn } from './lib/utils';

type Tab = 'checkout' | 'inventory' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('checkout');
  const [inventory, setInventory] = useState<Product[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    setInventory(getInventory());
  }, []);

  const handleScan = (barcode: string) => {
    const product = inventory.find(p => p.barcode === barcode);
    if (product) {
      addToCart(product);
      // Optional: Vibrate or sound
      if ('vibrate' in navigator) navigator.vibrate(100);
    } else {
      // If product not found, maybe prompt to add it?
      alert(`未找到条码: ${barcode}`);
    }
    setIsScanning(false);
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.barcode || !editingProduct?.name || editingProduct?.price === undefined) return;

    const newInventory = [...inventory];
    if (editingProduct.id) {
      const index = newInventory.findIndex(p => p.id === editingProduct.id);
      newInventory[index] = editingProduct as Product;
    } else {
      newInventory.push({
        ...editingProduct,
        id: crypto.randomUUID(),
      } as Product);
    }

    setInventory(newInventory);
    saveInventory(newInventory);
    setShowEditModal(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('确定要删除该商品吗？')) {
      const newInventory = inventory.filter(p => p.id !== id);
      setInventory(newInventory);
      saveInventory(newInventory);
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(inventory, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (Array.isArray(data)) {
          setInventory(data);
          saveInventory(data);
          alert('导入成功');
        }
      } catch (err) {
        alert('导入失败：文件格式错误');
      }
    };
    reader.readAsText(file);
  };

  const shareData = async () => {
    const dataStr = JSON.stringify(inventory);
    if (navigator.share) {
      try {
        await navigator.share({
          title: '库存数据备份',
          text: dataStr,
        });
      } catch (err) {
        console.error('分享失败', err);
      }
    } else {
      navigator.clipboard.writeText(dataStr);
      alert('数据已复制到剪贴板');
    }
  };

  const filteredInventory = inventory.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.barcode.includes(searchQuery)
  );

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-neutral-50 shadow-2xl overflow-hidden relative">
      {/* Header */}
      <header className="px-6 py-4 bg-white border-b border-neutral-200 flex justify-between items-center shrink-0">
        <h1 className="text-xl font-bold tracking-tight text-neutral-900">
          {activeTab === 'checkout' && '收银结账'}
          {activeTab === 'inventory' && '库存管理'}
          {activeTab === 'settings' && '系统设置'}
        </h1>
        {activeTab === 'checkout' && cart.length > 0 && (
          <button 
            onClick={() => setCart([])}
            className="text-xs font-medium text-red-500 uppercase tracking-wider hover:bg-red-50 px-2 py-1 rounded"
          >
            清空订单
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'checkout' && (
            <motion.div 
              key="checkout"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6 space-y-6"
            >
              {/* Scanner Toggle */}
              <div className="space-y-4">
                {!isScanning ? (
                  <button 
                    onClick={() => setIsScanning(true)}
                    className="w-full py-12 border-2 border-dashed border-neutral-300 rounded-2xl flex flex-col items-center justify-center gap-3 text-neutral-500 hover:border-neutral-400 hover:bg-neutral-100 transition-all"
                  >
                    <Camera className="w-8 h-8" />
                    <span className="font-medium">点击开启扫码</span>
                  </button>
                ) : (
                  <div className="relative">
                    <Scanner onScan={handleScan} active={isScanning} />
                    <button 
                      onClick={() => setIsScanning(false)}
                      className="absolute top-2 right-2 p-2 bg-white/20 backdrop-blur-md rounded-full text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Cart Items */}
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-widest">当前订单</h2>
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-neutral-400 italic">
                    订单为空，请扫码添加商品
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map(item => (
                      <div key={item.id} className="bg-white p-4 rounded-2xl border border-neutral-200 flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-neutral-900">{item.name}</h3>
                          <p className="text-sm text-neutral-500">¥{item.price.toFixed(2)} × {item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center bg-neutral-100 rounded-lg overflow-hidden">
                            <button onClick={() => updateCartQuantity(item.id, -1)} className="p-2 hover:bg-neutral-200 text-neutral-600">
                              -
                            </button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <button onClick={() => updateCartQuantity(item.id, 1)} className="p-2 hover:bg-neutral-200 text-neutral-600">
                              +
                            </button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="p-2 text-red-400 hover:text-red-600">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'inventory' && (
            <motion.div 
              key="inventory"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6 space-y-6"
            >
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input 
                    type="text" 
                    placeholder="搜索名称或条码..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/5 transition-all"
                  />
                </div>
                <button 
                  onClick={() => {
                    setEditingProduct({ barcode: '', name: '', price: 0, stock: 0 });
                    setShowEditModal(true);
                  }}
                  className="p-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-3">
                {filteredInventory.map(product => (
                  <div key={product.id} className="bg-white p-4 rounded-2xl border border-neutral-200 flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-neutral-900">{product.name}</h3>
                      <p className="text-xs text-neutral-400 font-mono">{product.barcode}</p>
                      <div className="flex gap-4 mt-1">
                        <span className="text-sm font-semibold text-neutral-900">¥{product.price.toFixed(2)}</span>
                        <span className="text-sm text-neutral-500">库存: {product.stock}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setEditingProduct(product);
                          setShowEditModal(true);
                        }}
                        className="p-2 text-neutral-400 hover:text-neutral-900"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 text-red-300 hover:text-red-500"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
                {filteredInventory.length === 0 && (
                  <div className="text-center py-12 text-neutral-400 italic">
                    暂无商品数据
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6 space-y-8"
            >
              <section className="space-y-4">
                <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-widest">数据管理</h2>
                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={exportData}
                    className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-neutral-200 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                      <Download className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">导出数据</div>
                      <div className="text-xs text-neutral-400">下载库存 JSON 备份文件</div>
                    </div>
                  </button>

                  <label className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-neutral-200 hover:bg-neutral-50 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">导入数据</div>
                      <div className="text-xs text-neutral-400">从 JSON 文件恢复库存</div>
                    </div>
                    <input type="file" accept=".json" onChange={importData} className="hidden" />
                  </label>

                  <button 
                    onClick={shareData}
                    className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-neutral-200 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
                      <Share2 className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">分享/发送数据</div>
                      <div className="text-xs text-neutral-400">通过系统分享发送 JSON 数据</div>
                    </div>
                  </button>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-widest">关于应用</h2>
                <div className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-2">
                  <p className="text-sm text-neutral-600">版本: 1.0.0</p>
                  <p className="text-sm text-neutral-600">开发者: AI 助手</p>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    本应用专为移动端设计，支持各类主流条形码扫描。数据存储在浏览器本地，请定期导出备份。
                  </p>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Checkout Footer (Sticky) */}
      {activeTab === 'checkout' && cart.length > 0 && (
        <div className="absolute bottom-20 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-neutral-200 flex items-center justify-between z-10">
          <div>
            <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">总计金额</p>
            <p className="text-2xl font-bold text-neutral-900">¥{totalAmount.toFixed(2)}</p>
          </div>
          <button 
            onClick={() => {
              alert(`结账成功！总金额: ¥${totalAmount.toFixed(2)}`);
              setCart([]);
            }}
            className="px-8 py-3 bg-neutral-900 text-white rounded-2xl font-bold hover:bg-neutral-800 active:scale-95 transition-all flex items-center gap-2"
          >
            <Check className="w-5 h-5" />
            立即结账
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="h-20 bg-white border-t border-neutral-200 flex items-center justify-around px-4 shrink-0 safe-bottom z-20">
        <NavButton 
          active={activeTab === 'checkout'} 
          onClick={() => setActiveTab('checkout')}
          icon={<ShoppingCart className="w-6 h-6" />}
          label="结账"
        />
        <NavButton 
          active={activeTab === 'inventory'} 
          onClick={() => setActiveTab('inventory')}
          icon={<Package className="w-6 h-6" />}
          label="库存"
        />
        <NavButton 
          active={activeTab === 'settings'} 
          onClick={() => setActiveTab('settings')}
          icon={<Settings className="w-6 h-6" />}
          label="设置"
        />
      </nav>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
              className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-8 space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">{editingProduct?.id ? '编辑商品' : '新增商品'}</h3>
                <button onClick={() => setShowEditModal(false)} className="p-2 text-neutral-400 hover:text-neutral-900">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">条形码</label>
                  <div className="flex gap-2">
                    <input 
                      required
                      type="text" 
                      value={editingProduct?.barcode || ''}
                      onChange={(e) => setEditingProduct(prev => ({ ...prev, barcode: e.target.value }))}
                      className="flex-1 px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/5"
                      placeholder="扫描或输入条码"
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        // In a real app, we'd open a mini scanner here
                        const code = prompt('请输入扫描到的条码:');
                        if (code) setEditingProduct(prev => ({ ...prev, barcode: code }));
                      }}
                      className="p-3 bg-neutral-100 rounded-xl text-neutral-600"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">商品名称</label>
                  <input 
                    required
                    type="text" 
                    value={editingProduct?.name || ''}
                    onChange={(e) => setEditingProduct(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/5"
                    placeholder="例如: 可口可乐 500ml"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">单价 (¥)</label>
                    <input 
                      required
                      type="number" 
                      step="0.01"
                      value={editingProduct?.price || ''}
                      onChange={(e) => setEditingProduct(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/5"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">库存数量</label>
                    <input 
                      required
                      type="number" 
                      value={editingProduct?.stock || ''}
                      onChange={(e) => setEditingProduct(prev => ({ ...prev, stock: parseInt(e.target.value) }))}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/5"
                      placeholder="0"
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full py-4 bg-neutral-900 text-white rounded-2xl font-bold hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-900/10"
                >
                  保存商品
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-all",
        active ? "text-neutral-900 scale-110" : "text-neutral-400 hover:text-neutral-600"
      )}
    >
      <div className={cn(
        "p-2 rounded-xl transition-all",
        active ? "bg-neutral-100" : "bg-transparent"
      )}>
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
}
