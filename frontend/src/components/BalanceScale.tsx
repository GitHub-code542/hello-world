interface BalanceScaleProps {
  totalAssets: number;
  totalLiabilities: number;
}

export const BalanceScale = ({ totalAssets, totalLiabilities }: BalanceScaleProps) => {
  const diff = totalAssets - totalLiabilities;
  const maxValue = Math.max(totalAssets, totalLiabilities, 1);

  // Calculate tilt angle (-15 to +15 degrees)
  const tiltAngle = Math.max(-15, Math.min(15, (diff / maxValue) * 15));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatus = () => {
    if (diff > 0) return { text: 'Positive Net Worth', color: 'text-green-600' };
    if (diff < 0) return { text: 'Negative Net Worth', color: 'text-red-600' };
    return { text: 'Balanced', color: 'text-blue-600' };
  };

  const status = getStatus();

  return (
    <div className="card">
      <h3 className="text-xl font-bold text-center mb-8">Financial Balance</h3>

      {/* Scale Visualization */}
      <div className="relative h-64 flex items-center justify-center mb-8">
        {/* Fulcrum */}
        <div className="absolute bottom-0 w-4 h-32 bg-gradient-to-t from-gray-700 to-gray-600 rounded-t-full"
             style={{ zIndex: 10 }} />

        {/* Balance Beam */}
        <div
          className="absolute w-96 h-4 bg-gradient-to-r from-gray-600 via-gray-700 to-gray-600 rounded-full shadow-lg transition-transform duration-500 ease-out"
          style={{
            transform: `rotate(${tiltAngle}deg)`,
            transformOrigin: 'center',
            top: '60px',
          }}
        >
          {/* Left Pan (Assets) */}
          <div
            className="absolute -left-4 -top-24 flex flex-col items-center"
            style={{ transform: `rotate(${-tiltAngle}deg)` }}
          >
            <div className="w-32 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl shadow-xl flex items-center justify-center transform hover:scale-105 transition-transform">
              <div className="text-center text-white">
                <div className="text-xs font-medium mb-1">Assets</div>
                <div className="text-sm font-bold">{formatCurrency(totalAssets)}</div>
              </div>
            </div>
            <div className="w-1 h-8 bg-gray-600"></div>
          </div>

          {/* Right Pan (Liabilities) */}
          <div
            className="absolute -right-4 -top-24 flex flex-col items-center"
            style={{ transform: `rotate(${-tiltAngle}deg)` }}
          >
            <div className="w-32 h-24 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl shadow-xl flex items-center justify-center transform hover:scale-105 transition-transform">
              <div className="text-center text-white">
                <div className="text-xs font-medium mb-1">Liabilities</div>
                <div className="text-sm font-bold">{formatCurrency(totalLiabilities)}</div>
              </div>
            </div>
            <div className="w-1 h-8 bg-gray-600"></div>
          </div>
        </div>
      </div>

      {/* Status and Net Worth */}
      <div className="text-center space-y-2">
        <p className={`text-lg font-semibold ${status.color}`}>{status.text}</p>
        <div className="text-3xl font-bold text-gray-900">
          Net Worth: {formatCurrency(diff)}
        </div>
        <p className="text-sm text-gray-600">
          {diff >= 0 ? 'Keep building your wealth!' : 'Focus on reducing liabilities'}
        </p>
      </div>
    </div>
  );
};
