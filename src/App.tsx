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
  Plus,
  Trash2,
  Target,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Types
interface CommissionRates {
  level1: number; // Top level
  level2: number; // Middle level
  level3: number; // Bottom level
}

interface ProductInfo {
  id: string;
  name: string;
  price: number;
  costRatio: number; // Percentage of price that is cost
  quantity: number; // Estimated sales
}

export default function App() {
  // State for Settings
  const [rates, setRates] = useState<CommissionRates>({
    level1: 15,
    level2: 10,
    level3: 5,
  });

  // State for Products
  const [products, setProducts] = useState<ProductInfo[]>([
    {
      id: '1',
      name: '高級私人音樂廳系統',
      price: 50000,
      costRatio: 40,
      quantity: 10,
    }
  ]);

  // State for Target Profit
  const [targetProfit, setTargetProfit] = useState<number>(100000);
  
  // UI State
  const [activeTab, setActiveTab] = useState<'calculator' | 'settings'>('calculator');

  // Product Actions
  const addProduct = () => {
    const newProduct: ProductInfo = {
      id: Math.random().toString(36).substr(2, 9),
      name: `新產品 ${products.length + 1}`,
      price: 10000,
      costRatio: 30,
      quantity: 5,
    };
    setProducts([...products, newProduct]);
  };

  const removeProduct = (id: string) => {
    if (products.length > 1) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const updateProduct = (id: string, updates: Partial<ProductInfo>) => {
    setProducts(products.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  // Calculations
  const calculations = useMemo(() => {
    const productCalculations = products.map(p => {
      const unitProfit = p.price * (1 - p.costRatio / 100);
      const l1Bonus = (p.price * rates.level1) / 100;
      const l2Bonus = (p.price * rates.level2) / 100;
      const l3Bonus = (p.price * rates.level3) / 100;
      const totalPool = l1Bonus + l2Bonus + l3Bonus;

      return {
        ...p,
        unitProfit,
        l1Bonus,
        l2Bonus,
        l3Bonus,
        totalPool,
        totalProfit: unitProfit * p.quantity,
        totalBonus: totalPool * p.quantity,
        // Scenario: Level 3 is the seller
        l3Seller: {
          self: l3Bonus,
          parent: l2Bonus,
          grandparent: l1Bonus,
          total: totalPool
        },
        // Scenario: Level 2 is the seller
        l2Seller: {
          self: l2Bonus + l3Bonus,
          parent: l1Bonus,
          total: totalPool
        },
        // Scenario: Level 1 is the seller
        l1Seller: {
          self: totalPool,
          total: totalPool
        }
      };
    });

    const totalEstimatedProfit = productCalculations.reduce((sum, p) => sum + p.totalProfit, 0);
    const totalEstimatedBonus = productCalculations.reduce((sum, p) => sum + p.totalBonus, 0);

    // Goal Seek: How many units of EACH product alone would reach the target?
    const goalSeek = productCalculations.map(p => ({
      name: p.name,
      requiredQuantity: Math.ceil(targetProfit / p.unitProfit)
    }));

    return {
      productCalculations,
      totalEstimatedProfit,
      totalEstimatedBonus,
      goalSeek
    };
  }, [products, rates, targetProfit]);

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
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Layers className="text-white w-5 h-5" />
            </div>
            <h1 className="font-bold text-lg tracking-tight hidden sm:block">私人音樂廳分銷試算</h1>
            <h1 className="font-bold text-lg tracking-tight sm:hidden">分銷試算</h1>
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

      <main className="max-w-6xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'calculator' ? (
            <motion.div
              key="calc"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 xl:grid-cols-12 gap-8"
            >
              {/* Left Column: Inputs (Products) */}
              <div className="xl:col-span-4 space-y-6">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-gray-400" />
                    <h2 className="font-bold text-gray-500 uppercase tracking-widest text-sm">產品清單</h2>
                  </div>
                  <button 
                    onClick={addProduct}
                    className="flex items-center gap-1 text-xs font-bold bg-black text-white px-3 py-1.5 rounded-full hover:bg-gray-800 transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    新增產品
                  </button>
                </div>

                <div className="space-y-4">
                  {products.map((p, index) => (
                    <section key={p.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative group">
                      {products.length > 1 && (
                        <button 
                          onClick={() => removeProduct(p.id)}
                          className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">產品 #{index + 1} 名稱</label>
                          <input
                            type="text"
                            value={p.name}
                            onChange={(e) => updateProduct(p.id, { name: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">售價 (TWD)</label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                              <input
                                type="number"
                                value={p.price}
                                onChange={(e) => updateProduct(p.id, { price: Number(e.target.value) })}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-sm"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">預估銷量</label>
                            <input
                              type="number"
                              min="0"
                              value={p.quantity}
                              onChange={(e) => updateProduct(p.id, { quantity: Number(e.target.value) })}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">成本比例 ({p.costRatio}%)</label>
                            <span className="text-[10px] font-mono text-gray-400">毛利: {100 - p.costRatio}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={p.costRatio}
                            onChange={(e) => updateProduct(p.id, { costRatio: Number(e.target.value) })}
                            className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-black"
                          />
                        </div>
                      </div>
                    </section>
                  ))}
                </div>

                {/* Target Profit Section */}
                <section className="bg-black text-white p-6 rounded-3xl shadow-xl">
                  <div className="flex items-center gap-2 mb-6">
                    <Target className="w-5 h-5 text-gray-400" />
                    <h2 className="font-semibold">利潤目標回推</h2>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">設定總利潤目標 (TWD)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          type="number"
                          value={targetProfit}
                          onChange={(e) => setTargetProfit(Number(e.target.value))}
                          className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-white focus:border-transparent outline-none transition-all text-lg font-light"
                        />
                      </div>
                    </div>
                    
                    <div className="pt-4 space-y-3">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">若僅銷售單一產品需達成：</p>
                      {calculations.goalSeek.map((seek, i) => (
                        <div key={i} className="flex items-center justify-between bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                          <span className="text-xs text-gray-300 truncate max-w-[150px]">{seek.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{seek.requiredQuantity}</span>
                            <span className="text-[10px] text-gray-500">件</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column: Results */}
              <div className="xl:col-span-8 space-y-8">
                {/* Global Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">預估總利潤 (扣除成本)</p>
                    </div>
                    <h3 className="text-4xl font-light tracking-tight text-black">
                      {formatCurrency(calculations.totalEstimatedProfit)}
                    </h3>
                    <div className="mt-4 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-black transition-all duration-1000" 
                          style={{ width: `${Math.min(100, (calculations.totalEstimatedProfit / targetProfit) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400">
                        目標達成 {Math.round((calculations.totalEstimatedProfit / targetProfit) * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-blue-500" />
                      <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">預估體系總撥出獎金</p>
                    </div>
                    <h3 className="text-4xl font-light tracking-tight text-black">
                      {formatCurrency(calculations.totalEstimatedBonus)}
                    </h3>
                    <p className="mt-4 text-[10px] text-gray-400">
                      基於 {products.reduce((s, p) => s + p.quantity, 0)} 件總銷售量計算
                    </p>
                  </div>
                </div>

                {/* Detailed Product Breakdown */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">分潤場景模擬 (依產品)</h2>
                    <div className="flex gap-4 text-[10px] font-bold text-gray-400 uppercase">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-black" /> 三級
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-blue-500" /> 二級
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-green-500" /> 一級
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {calculations.productCalculations.map((p) => (
                      <div key={p.id} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-8 py-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-sm">{p.name}</span>
                            <span className="text-[10px] text-gray-400">單價: {formatCurrency(p.price)}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-[10px] text-gray-400 uppercase font-bold">預估利潤</p>
                              <p className="text-sm font-bold">{formatCurrency(p.totalProfit)}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-8 space-y-8">
                          {/* Scenario A: L3 Sells */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-gray-600">場景 A：三級代理成交 (最完整體系)</span>
                              <span className="text-[10px] text-gray-400">總獎金: {formatCurrency(p.totalPool)}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">三級 ({rates.level3}%)</p>
                                <p className="text-lg font-medium">{formatCurrency(p.l3Seller.self)}</p>
                              </div>
                              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">二級 ({rates.level2}%)</p>
                                <p className="text-lg font-medium">{formatCurrency(p.l3Seller.parent)}</p>
                              </div>
                              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">一級 ({rates.level1}%)</p>
                                <p className="text-lg font-medium">{formatCurrency(p.l3Seller.grandparent)}</p>
                              </div>
                            </div>
                          </div>

                          {/* Scenario B: L2 Sells */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-gray-600">場景 B：二級代理成交 (無下層)</span>
                              <span className="text-[10px] text-gray-400">總獎金: {formatCurrency(p.totalPool)}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="col-span-2 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                                <p className="text-[9px] font-bold text-blue-400 uppercase mb-1">二級 (自己 - 領取 {rates.level2 + rates.level3}%)</p>
                                <p className="text-lg font-medium text-blue-900">{formatCurrency(p.l2Seller.self)}</p>
                              </div>
                              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">一級 ({rates.level1}%)</p>
                                <p className="text-lg font-medium">{formatCurrency(p.l2Seller.parent)}</p>
                              </div>
                            </div>
                          </div>

                          {/* Scenario C: L1 Sells */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-gray-600">場景 C：一級代理成交 (全額領取)</span>
                              <span className="text-[10px] text-gray-400">總獎金: {formatCurrency(p.totalPool)}</span>
                            </div>
                            <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                              <p className="text-[9px] font-bold text-green-600 uppercase mb-1">一級 (自己 - 領取全額 {rates.level1 + rates.level2 + rates.level3}%)</p>
                              <p className="text-lg font-medium text-green-900">{formatCurrency(p.l1Seller.self)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
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
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
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
      <footer className="max-w-6xl mx-auto px-4 py-12 text-center text-gray-400 text-xs">
        <p>© 2026 私人音樂廳產品分銷體系 · 專業多產品分潤試算工具</p>
      </footer>
    </div>
  );
}
