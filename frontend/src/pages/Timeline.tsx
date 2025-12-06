import { useState, useEffect } from 'react';
import { goalService } from '@/services/goalService';
import { Goal } from '@/types';
import { Plus, Trash2, Edit2, Save, X, Target } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useAuthStore } from '@/stores/authStore';

interface TimelineDataPoint {
  age: number;
  wealth: number;
  goals: { name: string; amount: number }[];
}

export const Timeline = () => {
  const { user } = useAuthStore();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [currentAge, setCurrentAge] = useState(user?.current_age || 30);
  const [retirementAge, setRetirementAge] = useState(user?.retirement_age || 60);
  const [lifeExpectancy, setLifeExpectancy] = useState(user?.life_expectancy || 100);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    setLoading(true);
    try {
      const response = await goalService.getAll();
      if (response.success && response.data) {
        setGoals(response.data);
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async () => {
    const name = prompt('Enter goal name (e.g., Buy House, Education, Vacation):');
    if (!name) return;

    const ageStr = prompt(`Enter target age (current age: ${currentAge}):`);
    if (!ageStr) return;

    const age = parseInt(ageStr);
    if (isNaN(age) || age < currentAge || age > lifeExpectancy) {
      alert(`Please enter a valid age between ${currentAge} and ${lifeExpectancy}`);
      return;
    }

    const amountStr = prompt('Enter target amount:');
    if (!amountStr) return;

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      alert('Invalid amount');
      return;
    }

    try {
      const response = await goalService.create({
        goal_name: name,
        target_age: age,
        target_amount: amount,
        priority: 'medium',
        status: 'pending',
      });

      if (response.success && response.data) {
        setGoals([...goals, response.data]);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error adding goal');
    }
  };

  const handleAddRetirement = async () => {
    // Check if retirement goal already exists
    const hasRetirement = goals.some((g) => g.goal_name.toLowerCase().includes('retirement'));
    if (hasRetirement) {
      alert('Retirement goal already added! You can only have one retirement goal.');
      return;
    }

    const amountStr = prompt('Enter retirement corpus needed:');
    if (!amountStr) return;

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      alert('Invalid amount');
      return;
    }

    try {
      const response = await goalService.create({
        goal_name: 'Retirement',
        target_age: retirementAge,
        target_amount: amount,
        priority: 'high',
        status: 'pending',
      });

      if (response.success && response.data) {
        setGoals([...goals, response.data]);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error adding retirement goal');
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      await goalService.delete(id);
      setGoals(goals.filter((g) => g.id !== id));
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error deleting goal');
    }
  };

  const handleUpdateGoal = async (goal: Goal) => {
    try {
      const response = await goalService.update(goal.id!, {
        target_age: goal.target_age,
        target_amount: goal.target_amount,
      });

      if (response.success) {
        setEditingGoal(null);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error updating goal');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Generate timeline data
  const generateTimelineData = (): TimelineDataPoint[] => {
    const data: TimelineDataPoint[] = [];
    const ageRange = lifeExpectancy - currentAge;

    for (let i = 0; i <= ageRange; i += 5) {
      const age = currentAge + i;
      const goalsAtAge = goals
        .filter((g) => g.target_age === age)
        .map((g) => ({ name: g.goal_name, amount: g.target_amount }));

      data.push({
        age,
        wealth: 0, // This would be calculated based on projected savings
        goals: goalsAtAge,
      });
    }

    return data;
  };

  const timelineData = generateTimelineData();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Financial Timeline</h2>
        <div className="flex gap-2">
          <button onClick={handleAddRetirement} className="btn btn-primary flex items-center gap-2">
            <Target className="w-4 h-4" />
            Add Retirement
          </button>
          <button onClick={handleAddGoal} className="btn btn-secondary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Goal
          </button>
        </div>
      </div>

      {/* Age Configuration */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Timeline Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Age</label>
            <input
              type="number"
              value={currentAge}
              onChange={(e) => setCurrentAge(parseInt(e.target.value) || 30)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Retirement Age</label>
            <input
              type="number"
              value={retirementAge}
              onChange={(e) => setRetirementAge(parseInt(e.target.value) || 60)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Life Expectancy</label>
            <input
              type="number"
              value={lifeExpectancy}
              onChange={(e) => setLifeExpectancy(parseInt(e.target.value) || 100)}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Timeline Chart */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4">Goals Timeline</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="age"
              label={{ value: 'Age', position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft' }}
              tickFormatter={(value) => `₹${value / 100000}L`}
            />
            <Tooltip
              formatter={(value: any) => formatCurrency(value)}
              labelFormatter={(label) => `Age ${label}`}
            />
            <Legend />
            <ReferenceLine
              x={currentAge}
              stroke="#0ea5e9"
              label="Current Age"
              strokeDasharray="5 5"
            />
            <ReferenceLine
              x={retirementAge}
              stroke="#ef4444"
              label="Retirement"
              strokeDasharray="5 5"
            />
            <Line type="monotone" dataKey="wealth" stroke="#10b981" name="Projected Wealth" />
            {goals.map((goal, index) => (
              <ReferenceLine
                key={goal.id}
                x={goal.target_age}
                stroke={goal.priority === 'high' ? '#ef4444' : '#f59e0b'}
                label={goal.goal_name}
                strokeDasharray="3 3"
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Goals List */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4">Your Goals</h3>
        <div className="space-y-3">
          {goals.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No goals added yet. Start planning your future!</p>
          ) : (
            goals
              .sort((a, b) => a.target_age - b.target_age)
              .map((goal) => (
                <div
                  key={goal.id}
                  className={`p-4 rounded-lg border-2 ${getPriorityColor(goal.priority || 'medium')}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-lg">{goal.goal_name}</h4>
                        <span className="text-xs font-medium px-2 py-1 bg-white rounded-full">
                          {goal.priority?.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm">
                        Target Age: {goal.target_age} ({goal.target_age - currentAge} years from now)
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {editingGoal === goal.id ? (
                        <>
                          <div className="flex flex-col gap-2">
                            <input
                              type="number"
                              value={goal.target_age}
                              onChange={(e) =>
                                setGoals(
                                  goals.map((g) =>
                                    g.id === goal.id
                                      ? { ...g, target_age: parseInt(e.target.value) || currentAge }
                                      : g
                                  )
                                )
                              }
                              className="w-24 px-2 py-1 text-sm border rounded"
                              placeholder="Age"
                            />
                            <input
                              type="number"
                              value={goal.target_amount}
                              onChange={(e) =>
                                setGoals(
                                  goals.map((g) =>
                                    g.id === goal.id
                                      ? { ...g, target_amount: parseFloat(e.target.value) || 0 }
                                      : g
                                  )
                                )
                              }
                              className="w-32 px-2 py-1 text-sm border rounded"
                              placeholder="Amount"
                            />
                          </div>
                          <button
                            onClick={() => handleUpdateGoal(goal)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Save className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setEditingGoal(null)}
                            className="text-gray-600 hover:text-gray-700"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="font-bold text-xl">
                            {formatCurrency(goal.target_amount)}
                          </span>
                          <button
                            onClick={() => setEditingGoal(goal.id!)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteGoal(goal.id!)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};
