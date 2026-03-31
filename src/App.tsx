/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Settings as SettingsIcon, 
  TrendingUp, 
  DollarSign, 
  Layers, 
  Package, 
  Info,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Types
interface CommissionRates {
  level1: number; // Top level
  level2: number; // Middle level
  level3: number; // Bottom level
}

interface ProductInfo {
  name: string;
  price: number;
  costRatio: number; // Percentage of price that is cost
}

export default function App() {
  // State for Settings
  const [rates, setRates] = useState<CommissionRates>({
    level1: 15,
    level2: 10,
    level3: 5,
  });

  // State for Product
  const [product, setProduct] = useState<ProductInfo>({
    name: '高級私人音樂廳系統',
    price: 50000,
    costRatio: 40,
  });

  // State for Estimation
  const [quantity, setQuantity] = useState<number>(10);
  
  // UI State
  const [activeTab, setActiveTab] = useState<'calculator' | 'settings'>('calculator');

  // Calculations
  const calculations = useMemo(() => {
    const profit = product.price * (1 - product.costRatio / 100);
    
    // Calculate individual bonuses based on the profit
    // User logic: "If there is no upper level, you can get the full percentage bonus."
    // Interpretation: 
    // If Level 3 sells: L3 gets L3 rate, L2 gets L2 rate, L1 gets L1 rate.
    // If Level 2 sells: L2 gets L2 rate + L3 rate (since no L3 below them?), 
    // OR L2 gets L2 rate and L1 gets L1 rate, and the "L3" portion goes to L2?
    // Let's follow a "Roll-up" logic:
    // The total commission pool is L1 + L2 + L3.
    // A seller always gets their level's rate PLUS all lower levels' rates (because they have no one below them to share with).
    // And their parents get their respective fixed rates.
    
    const l1Bonus = (product.price * rates.level1) / 100;
    const l2Bonus = (product.price * rates.level2) / 100;
    const l3Bonus = (product.price * rates.level3) / 100;

    const totalPool = l1Bonus + l2Bonus + l3Bonus;

    return {
      profit,
      l1Bonus,
      l2Bonus,
      l3Bonus,
      totalPool,
      // Scenario: Level 3 is the seller
      l3Seller: {
        self: l3Bonus,
        parent: l2Bonus,
        grandparent: l1Bonus,
        total: l1Bonus + l2Bonus + l3Bonus
      },
      // Scenario: Level 2 is the seller
      l2Seller: {
        self: l2Bonus + l3Bonus, // Gets their own + what would have gone to L3
        parent: l1Bonus,
        total: l1Bonus + l2Bonus + l3Bonus
      },
      // Scenario: Level 1 is the seller
      l1Seller: {
        self: l1Bonus + l2Bonus + l3Bonus, // Gets everything
        total: l1Bonus + l2Bonus + l3Bonus
      }
    };
  }, [product, rates]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a] font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Layers className="text-white w-5 h-5" />
            </div>
            <h1 className="font-bold text-lg tracking-tight">私人音樂廳分銷試算</h1>
          </div>
          <nav className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'calculator' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                試算器
              </div>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'settings' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <SettingsIcon className="w-4 h-4" />
                分潤設置
              </div>
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'calculator' ? (
            <motion.div
              key="calc"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Left Column: Inputs */}
              <div className="lg:col-span-1 space-y-6">
                <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-6">
                    <Package className="w-5 h-5 text-gray-400" />
                    <h2 className="font-semibold">產品資訊</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">產品名稱</label>
                      <input
                        type="text"
                        value={product.name}
                        onChange={(e) => setProduct({ ...product, name: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">實際銷售價 (TWD)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          value={product.price}
                          onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">成本比例 ({product.costRatio}%)</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={product.costRatio}
                        onChange={(e) => setProduct({ ...product, costRatio: Number(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                      />
                      <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-mono">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="w-5 h-5 text-gray-400" />
                    <h2 className="font-semibold">銷售預估</h2>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">總銷售數量</label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </section>
              </div>

              {/* Right Column: Results */}
              <div className="lg:col-span-2 space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-black text-white p-6 rounded-3xl shadow-lg">
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-1">單件總利潤 (扣除成本)</p>
                    <h3 className="text-3xl font-light tracking-tight">{formatCurrency(calculations.profit)}</h3>
                  </div>
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-1">單件總撥出獎金</p>
                    <h3 className="text-3xl font-light tracking-tight text-black">{formatCurrency(calculations.totalPool)}</h3>
                  </div>
                </div>

                {/* Detailed Scenarios */}
                <div className="space-y-4">
                  <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest px-2">分潤場景模擬</h2>
                  
                  {/* Scenario 1: Level 3 Sells */}
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                      <span className="text-sm font-bold">場景 A：由三級代理商成交</span>
                      <span className="text-xs bg-black text-white px-2 py-1 rounded-full">最完整體系</span>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">三級代理 (自己)</p>
                        <p className="text-xl font-medium">{formatCurrency(calculations.l3Seller.self)}</p>
                        <p className="text-[10px] text-gray-400">分潤比例: {rates.level3}%</p>
                      </div>
                      <div className="space-y-1 border-l border-gray-100 md:pl-6">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">二級代理 (上一層)</p>
                        <p className="text-xl font-medium">{formatCurrency(calculations.l3Seller.parent)}</p>
                        <p className="text-[10px] text-gray-400">分潤比例: {rates.level2}%</p>
                      </div>
                      <div className="space-y-1 border-l border-gray-100 md:pl-6">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">一級代理 (上上層)</p>
                        <p className="text-xl font-medium">{formatCurrency(calculations.l3Seller.grandparent)}</p>
                        <p className="text-[10px] text-gray-400">分潤比例: {rates.level1}%</p>
                      </div>
                    </div>
                    <div className="px-6 py-3 bg-gray-50/50 text-[11px] text-gray-500 flex items-center gap-2">
                      <Info className="w-3 h-3" />
                      預估 {quantity} 件總分潤：自己 {formatCurrency(calculations.l3Seller.self * quantity)} / 體系總計 {formatCurrency(calculations.l3Seller.total * quantity)}
                    </div>
                  </div>

                  {/* Scenario 2: Level 2 Sells */}
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                      <span className="text-sm font-bold">場景 B：由二級代理商成交</span>
                      <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">無下層分潤</span>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">二級代理 (自己)</p>
                        <p className="text-xl font-medium">{formatCurrency(calculations.l2Seller.self)}</p>
                        <p className="text-[10px] text-gray-400">含二級({rates.level2}%) + 三級({rates.level3}%) 比例</p>
                      </div>
                      <div className="space-y-1 border-l border-gray-100 md:pl-6">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">一級代理 (上一層)</p>
                        <p className="text-xl font-medium">{formatCurrency(calculations.l2Seller.parent)}</p>
                        <p className="text-[10px] text-gray-400">分潤比例: {rates.level1}%</p>
                      </div>
                      <div className="space-y-1 border-l border-gray-100 md:pl-6 flex items-center text-gray-300">
                        <p className="text-xs italic">無上上層</p>
                      </div>
                    </div>
                    <div className="px-6 py-3 bg-gray-50/50 text-[11px] text-gray-500 flex items-center gap-2">
                      <Info className="w-3 h-3" />
                      預估 {quantity} 件總分潤：自己 {formatCurrency(calculations.l2Seller.self * quantity)} / 體系總計 {formatCurrency(calculations.l2Seller.total * quantity)}
                    </div>
                  </div>

                  {/* Scenario 3: Level 1 Sells */}
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                      <span className="text-sm font-bold">場景 C：由一級代理商成交</span>
                      <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">全額分潤</span>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">一級代理 (自己)</p>
                        <p className="text-xl font-medium">{formatCurrency(calculations.l1Seller.self)}</p>
                        <p className="text-[10px] text-gray-400">含一級+二級+三級 全額比例 ({rates.level1 + rates.level2 + rates.level3}%)</p>
                      </div>
                      <div className="md:col-span-2 flex items-center text-gray-300 pl-6 border-l border-gray-100">
                        <p className="text-xs italic">無上層，領取全額獎金比例</p>
                      </div>
                    </div>
                    <div className="px-6 py-3 bg-gray-50/50 text-[11px] text-gray-500 flex items-center gap-2">
                      <Info className="w-3 h-3" />
                      預估 {quantity} 件總分潤：自己 {formatCurrency(calculations.l1Seller.self * quantity)}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-gray-100 rounded-2xl">
                    <SettingsIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">分潤比例設置</h2>
                    <p className="text-sm text-gray-400">設置各層級代理商可獲得的獎金百分比</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <label className="text-sm font-bold">一級代理商 (最高層)</label>
                      <span className="text-2xl font-light">{rates.level1}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="0.5"
                      value={rates.level1}
                      onChange={(e) => setRates({ ...rates, level1: Number(e.target.value) })}
                      className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-black"
                    />
                    <p className="text-xs text-gray-400 italic">當三級代理商成交時，一級代理商可分得的比例。</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <label className="text-sm font-bold">二級代理商 (中層)</label>
                      <span className="text-2xl font-light">{rates.level2}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="0.5"
                      value={rates.level2}
                      onChange={(e) => setRates({ ...rates, level2: Number(e.target.value) })}
                      className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-black"
                    />
                    <p className="text-xs text-gray-400 italic">當三級代理商成交時，二級代理商可分得的比例。</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <label className="text-sm font-bold">三級代理商 (底層/成交者)</label>
                      <span className="text-2xl font-light">{rates.level3}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="0.5"
                      value={rates.level3}
                      onChange={(e) => setRates({ ...rates, level3: Number(e.target.value) })}
                      className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-black"
                    />
                    <p className="text-xs text-gray-400 italic">直接成交產品的代理商可獲得的基礎比例。</p>
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <div className="bg-gray-50 p-4 rounded-2xl flex items-start gap-3">
                      <Info className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div className="text-xs text-gray-500 leading-relaxed">
                        <p className="font-bold text-gray-700 mb-1">計算邏輯說明：</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>總撥出獎金比例為三層之和：{(rates.level1 + rates.level2 + rates.level3).toFixed(1)}%</li>
                          <li>若成交者為一級代理，因無上層，將獲得全額 {(rates.level1 + rates.level2 + rates.level3).toFixed(1)}% 獎金。</li>
                          <li>若成交者為二級代理，將獲得二級+三級的獎金比例，一級代理獲得其固定比例。</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('calculator')}
                    className="w-full bg-black text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                  >
                    保存並返回試算
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-4 py-12 text-center text-gray-400 text-xs">
        <p>© 2026 私人音樂廳產品分銷體系 · 專業分潤試算工具</p>
      </footer>
    </div>
  );
}
