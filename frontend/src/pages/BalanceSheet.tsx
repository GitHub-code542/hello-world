import { useState, useEffect } from 'react';
import { BalanceScale } from '@/components/BalanceScale';
import { assetService } from '@/services/assetService';
import { liabilityService } from '@/services/liabilityService';
import { Asset, Liability } from '@/types';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';

export const BalanceSheet = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingAsset, setEditingAsset] = useState<string | null>(null);
  const [editingLiability, setEditingLiability] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [assetsRes, liabilitiesRes] = await Promise.all([
        assetService.getAll(),
        liabilityService.getAll(),
      ]);

      if (assetsRes.success && assetsRes.data) {
        setAssets(assetsRes.data);
      }
      if (liabilitiesRes.success && liabilitiesRes.data) {
        setLiabilities(liabilitiesRes.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAsset = async () => {
    const name = prompt('Enter asset name:');
    if (!name) return;

    const type = prompt('Enter asset type (e.g., Property, Stocks, Cash):');
    if (!type) return;

    const valueStr = prompt('Enter current value:');
    if (!valueStr) return;

    const value = parseFloat(valueStr);
    if (isNaN(value)) {
      alert('Invalid value');
      return;
    }

    try {
      const response = await assetService.create({
        asset_name: name,
        asset_type: type,
        current_value: value,
      });

      if (response.success && response.data) {
        setAssets([...assets, response.data]);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error adding asset');
    }
  };

  const handleAddLiability = async () => {
    const name = prompt('Enter liability name:');
    if (!name) return;

    const type = prompt('Enter liability type (e.g., Home Loan, Car Loan, Credit Card):');
    if (!type) return;

    const balanceStr = prompt('Enter current balance:');
    if (!balanceStr) return;

    const balance = parseFloat(balanceStr);
    if (isNaN(balance)) {
      alert('Invalid balance');
      return;
    }

    try {
      const response = await liabilityService.create({
        liability_name: name,
        liability_type: type,
        current_balance: balance,
      });

      if (response.success && response.data) {
        setLiabilities([...liabilities, response.data]);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error adding liability');
    }
  };

  const handleDeleteAsset = async (id: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;

    try {
      await assetService.delete(id);
      setAssets(assets.filter((a) => a.id !== id));
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error deleting asset');
    }
  };

  const handleDeleteLiability = async (id: string) => {
    if (!confirm('Are you sure you want to delete this liability?')) return;

    try {
      await liabilityService.delete(id);
      setLiabilities(liabilities.filter((l) => l.id !== id));
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error deleting liability');
    }
  };

  const handleUpdateAsset = async (asset: Asset) => {
    try {
      const response = await assetService.update(asset.id!, {
        current_value: asset.current_value,
      });

      if (response.success) {
        setEditingAsset(null);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error updating asset');
    }
  };

  const handleUpdateLiability = async (liability: Liability) => {
    try {
      const response = await liabilityService.update(liability.id!, {
        current_balance: liability.current_balance,
      });

      if (response.success) {
        setEditingLiability(null);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error updating liability');
    }
  };

  const totalAssets = assets.reduce((sum, a) => sum + a.current_value, 0);
  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.current_balance, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Balance Sheet</h2>

      {/* Balance Scale */}
      <BalanceScale totalAssets={totalAssets} totalLiabilities={totalLiabilities} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets Panel */}
        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-green-900">Assets</h3>
            <button onClick={handleAddAsset} className="btn btn-success flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Asset
            </button>
          </div>

          <div className="space-y-3">
            {assets.length === 0 ? (
              <p className="text-green-700 text-center py-8">No assets added yet</p>
            ) : (
              assets.map((asset) => (
                <div
                  key={asset.id}
                  className="bg-white rounded-lg p-4 shadow-sm border border-green-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{asset.asset_name}</h4>
                      <p className="text-sm text-gray-600">{asset.asset_type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {editingAsset === asset.id ? (
                        <>
                          <input
                            type="number"
                            value={asset.current_value}
                            onChange={(e) =>
                              setAssets(
                                assets.map((a) =>
                                  a.id === asset.id
                                    ? { ...a, current_value: parseFloat(e.target.value) || 0 }
                                    : a
                                )
                              )
                            }
                            className="w-32 px-2 py-1 text-sm border border-green-500 rounded"
                          />
                          <button
                            onClick={() => handleUpdateAsset(asset)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingAsset(null)}
                            className="text-gray-600 hover:text-gray-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="font-bold text-green-900">
                            {formatCurrency(asset.current_value)}
                          </span>
                          <button
                            onClick={() => setEditingAsset(asset.id!)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAsset(asset.id!)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-green-300">
            <div className="flex justify-between items-center">
              <span className="font-bold text-green-900">Total Assets:</span>
              <span className="text-2xl font-bold text-green-900">
                {formatCurrency(totalAssets)}
              </span>
            </div>
          </div>
        </div>

        {/* Liabilities Panel */}
        <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-red-900">Liabilities</h3>
            <button onClick={handleAddLiability} className="btn btn-danger flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Liability
            </button>
          </div>

          <div className="space-y-3">
            {liabilities.length === 0 ? (
              <p className="text-red-700 text-center py-8">No liabilities added yet</p>
            ) : (
              liabilities.map((liability) => (
                <div
                  key={liability.id}
                  className="bg-white rounded-lg p-4 shadow-sm border border-red-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{liability.liability_name}</h4>
                      <p className="text-sm text-gray-600">{liability.liability_type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {editingLiability === liability.id ? (
                        <>
                          <input
                            type="number"
                            value={liability.current_balance}
                            onChange={(e) =>
                              setLiabilities(
                                liabilities.map((l) =>
                                  l.id === liability.id
                                    ? { ...l, current_balance: parseFloat(e.target.value) || 0 }
                                    : l
                                )
                              )
                            }
                            className="w-32 px-2 py-1 text-sm border border-red-500 rounded"
                          />
                          <button
                            onClick={() => handleUpdateLiability(liability)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingLiability(null)}
                            className="text-gray-600 hover:text-gray-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="font-bold text-red-900">
                            {formatCurrency(liability.current_balance)}
                          </span>
                          <button
                            onClick={() => setEditingLiability(liability.id!)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteLiability(liability.id!)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-red-300">
            <div className="flex justify-between items-center">
              <span className="font-bold text-red-900">Total Liabilities:</span>
              <span className="text-2xl font-bold text-red-900">
                {formatCurrency(totalLiabilities)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
