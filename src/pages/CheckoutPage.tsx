import React from 'react';
import { Camera, Trash2, Check, X } from 'lucide-react';
import { Scanner } from '../components/Scanner';
import { Product, OrderItem } from '../lib/utils';

interface CheckoutPageProps {
  cart: OrderItem[];
  inventory: Product[];
  isScanning: boolean;
  setIsScanning: (val: boolean) => void;
  onAddToCart: (p: Product) => void;
  onUpdateQty: (id: string, d: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  cart, inventory, isScanning, setIsScanning, onAddToCart, onUpdateQty, onRemove, onCheckout
}) => {
  const handleScan = (barcode: string) => {
    const product = inventory.find(p => p.barcode === barcode);
    if (product) {
      onAddToCart(product);
      if ('vibrate' in navigator) navigator.vibrate(100);
    } else {
      alert(`未找到商品: ${barcode}`);
    }
    setIsScanning(false);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Scanner Section */}
      <div className="relative">
        {!isScanning ? (
          <button 
            onClick={() => setIsScanning(true)}
            className="w-full py-10 bg-white border-2 border-dashed border-neutral-200 rounded-3xl flex flex-col items-center gap-2 text-neutral-400 active:bg-neutral-50 transition-all"
          >
            <Camera className="w-8 h-8" />
            <span className="text-sm font-bold">点击扫描条形码</span>
          </button>
        ) : (
          <div className="relative rounded-3xl overflow-hidden shadow-xl">
            <Scanner onScan={handleScan} active={isScanning} />
            <button 
              onClick={() => setIsScanning(false)}
              className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md rounded-full text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Order List */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <h2 className="text-xs font-black text-neutral-400 uppercase tracking-[0.2em]">当前订单清单</h2>
          <span className="text-xs text-neutral-400">{cart.length} 件商品</span>
        </div>
        
        {cart.length === 0 ? (
          <div className="py-20 text-center text-neutral-300 italic text-sm">
            等待扫码添加商品...
          </div>
        ) : (
          <div className="space-y-3">
            {cart.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-2xl border border-neutral-100 flex items-center gap-4 shadow-sm">
                <div className="flex-1">
                  <h3 className="font-bold text-neutral-800">{item.name}</h3>
                  <p className="text-xs text-neutral-400 font-mono">¥{item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center bg-neutral-50 rounded-xl p-1">
                  <button onClick={() => onUpdateQty(item.id, -1)} className="w-8 h-8 flex items-center justify-center text-neutral-500 font-bold">-</button>
                  <span className="w-8 text-center text-sm font-black">{item.quantity}</span>
                  <button onClick={() => onUpdateQty(item.id, 1)} className="w-8 h-8 flex items-center justify-center text-neutral-500 font-bold">+</button>
                </div>
                <button onClick={() => onRemove(item.id)} className="text-red-300 hover:text-red-500 p-1">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Checkout Action */}
      {cart.length > 0 && (
        <div className="fixed bottom-24 left-4 right-4 bg-neutral-900 text-white p-5 rounded-3xl flex items-center justify-between shadow-2xl z-30">
          <div>
            <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">应付总额</p>
            <p className="text-2xl font-black">¥{cart.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)}</p>
          </div>
          <button 
            onClick={onCheckout}
            className="bg-white text-neutral-900 px-6 py-3 rounded-2xl font-black flex items-center gap-2 active:scale-95 transition-transform"
          >
            <Check className="w-5 h-5" />
            结账
          </button>
        </div>
      )}
    </div>
  );
};
