import { useState, useEffect } from 'react';
import { AmountSlider } from '@/components/AmountSlider';
import { financialService } from '@/services/financialService';
import { Save, RefreshCw } from 'lucide-react';

interface CategoryData {
  category: string;
  amount: number;
  data_type: 'income' | 'expense';
}

const INCOME_CATEGORIES = [
  'Salary / Business Income',
  'Rental Income',
  'Interest Income',
  'Dividend Income',
  'Other Income',
];

const EXPENSE_CATEGORIES = [
  'Housing (Rent/EMI)',
  'Food & Groceries',
  'Transportation',
  'Utilities',
  'Insurance',
  'Education',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Other Expenses',
];

export const IncomeExpenses = () => {
  const [incomeData, setIncomeData] = useState<CategoryData[]>(
    INCOME_CATEGORIES.map((cat) => ({ category: cat, amount: 0, data_type: 'income' as const }))
  );
  const [expenseData, setExpenseData] = useState<CategoryData[]>(
    EXPENSE_CATEGORIES.map((cat) => ({ category: cat, amount: 0, data_type: 'expense' as const }))
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await financialService.getAll();
      if (response.success && response.data) {
        // Map loaded data to categories
        const loadedIncome = incomeData.map((item) => {
          const found = response.data!.find(
            (d) => d.category === item.category && d.data_type === 'income'
          );
          return found ? { ...item, amount: found.amount } : item;
        });

        const loadedExpenses = expenseData.map((item) => {
          const found = response.data!.find(
            (d) => d.category === item.category && d.data_type === 'expense'
          );
          return found ? { ...item, amount: found.amount } : item;
        });

        setIncomeData(loadedIncome);
        setExpenseData(loadedExpenses);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIncomeChange = (index: number, value: number) => {
    const newData = [...incomeData];
    newData[index].amount = value;
    setIncomeData(newData);
  };

  const handleExpenseChange = (index: number, value: number) => {
    const newData = [...expenseData];
    newData[index].amount = value;
    setExpenseData(newData);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const allData = [...incomeData, ...expenseData];
      await financialService.save(allData);
      setMessage('Data saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Error saving data');
    } finally {
      setSaving(false);
    }
  };

  const totalIncome = incomeData.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenseData.reduce((sum, item) => sum + item.amount, 0);
  const netIncome = totalIncome - totalExpenses;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Income & Expenses</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.includes('success')
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <h3 className="text-sm font-medium text-green-700 mb-1">Total Income</h3>
          <p className="text-3xl font-bold text-green-900">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <h3 className="text-sm font-medium text-red-700 mb-1">Total Expenses</h3>
          <p className="text-3xl font-bold text-red-900">{formatCurrency(totalExpenses)}</p>
        </div>
        <div
          className={`card bg-gradient-to-br ${
            netIncome >= 0
              ? 'from-blue-50 to-blue-100 border-blue-200'
              : 'from-orange-50 to-orange-100 border-orange-200'
          }`}
        >
          <h3
            className={`text-sm font-medium ${
              netIncome >= 0 ? 'text-blue-700' : 'text-orange-700'
            } mb-1`}
          >
            Net Income
          </h3>
          <p
            className={`text-3xl font-bold ${
              netIncome >= 0 ? 'text-blue-900' : 'text-orange-900'
            }`}
          >
            {formatCurrency(netIncome)}
          </p>
        </div>
      </div>

      {/* Income Section */}
      <div className="card panel-dark">
        <h3 className="text-2xl font-bold mb-6">Monthly Income</h3>
        <div className="space-y-6">
          {incomeData.map((item, index) => (
            <AmountSlider
              key={item.category}
              label={item.category}
              value={item.amount}
              onChange={(value) => handleIncomeChange(index, value)}
              max={500000}
            />
          ))}
        </div>
      </div>

      {/* Expenses Section */}
      <div className="card panel-light">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Monthly Expenses</h3>
        <div className="space-y-6">
          {expenseData.map((item, index) => (
            <AmountSlider
              key={item.category}
              label={item.category}
              value={item.amount}
              onChange={(value) => handleExpenseChange(index, value)}
              max={200000}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
