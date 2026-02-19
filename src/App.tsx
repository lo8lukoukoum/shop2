import React, { useState } from 'react';
import { ShoppingCart, Package, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckoutPage } from './pages/CheckoutPage';
import { InventoryPage } from './pages/InventoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { useInventory } from './hooks/useInventory';
import { useCart } from './hooks/useCart';
import { cn } from './lib/utils';

type Tab = 'checkout' | 'inventory' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('checkout');
  const [isScanning, setIsScanning] = useState(false);
  
  const { inventory, addOrUpdateProduct, deleteProduct, setInventory } = useInventory();
  const { cart, addToCart, updateQuantity, removeItem, clearCart, total } = useCart();

  const handleCheckout = () => {
    alert(`结账成功！总计: ¥${total.toFixed(2)}`);
    clearCart();
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-neutral-50 overflow-hidden relative font-sans">
      {/* Header */}
      <header className="px-6 py-5 bg-white border-b border-neutral-100 flex justify-between items-center shrink-0 z-20">
        <h1 className="text-lg font-black tracking-tight text-neutral-900">
          {activeTab === 'checkout' && '收银结账'}
          {activeTab === 'inventory' && '库存管理'}
          {activeTab === 'settings' && '系统设置'}
        </h1>
        <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center">
          <span className="text-[10px] text-white font-black">AI</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'checkout' && (
              <CheckoutPage 
                cart={cart}
                inventory={inventory}
                isScanning={isScanning}
                setIsScanning={setIsScanning}
                onAddToCart={addToCart}
                onUpdateQty={updateQuantity}
                onRemove={removeItem}
                onCheckout={handleCheckout}
              />
            )}
            {activeTab === 'inventory' && (
              <InventoryPage 
                inventory={inventory}
                onAdd={addOrUpdateProduct}
                onDelete={deleteProduct}
              />
            )}
            {activeTab === 'settings' && (
              <SettingsPage 
                inventory={inventory}
                onImport={setInventory}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="h-24 bg-white/80 backdrop-blur-xl border-t border-neutral-100 flex items-center justify-around px-8 shrink-0 safe-bottom absolute bottom-0 left-0 right-0 z-40">
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
          label="仓库"
        />
        <NavButton 
          active={activeTab === 'settings'} 
          onClick={() => setActiveTab('settings')}
          icon={<Settings className="w-6 h-6" />}
          label="设置"
        />
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 transition-all",
        active ? "text-neutral-900" : "text-neutral-300"
      )}
    >
      <div className={cn(
        "p-2.5 rounded-2xl transition-all",
        active ? "bg-neutral-100 shadow-inner" : "bg-transparent"
      )}>
        {icon}
      </div>
      <span className="text-[9px] font-black uppercase tracking-[0.2em]">{label}</span>
    </button>
  );
}
