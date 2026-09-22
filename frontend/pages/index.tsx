import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Home() {
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    fetch('/api/trades')
      .then(res => res.json())
      .then(data => setTrades(data));
  }, []);

  return (
    <div className="bg-gray-900 text-white min-h-screen p-10">
      <h1 className="text-4xl font-bold mb-10">Professional Trading Journal</h1>
      
      {/* Chart Section */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg h-96">
        <h2 className="text-xl mb-4">P&L Performance Chart</h2>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trades}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="id" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip />
            <Line type="monotone" dataKey="profit" stroke="#3B82F6" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Trades Table */}
      <div className="mt-10">
        <table className="w-full bg-gray-800 rounded-lg overflow-hidden">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-4">Symbol</th>
              <th className="p-4">Profit/Loss</th>
            </tr>
          </thead>
          <tbody>
            {trades.map(trade => (
              <tr key={trade.id} className="border-b border-gray-700">
                <td className="p-4">{trade.symbol}</td>
                <td className={`p-4 ${trade.profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${trade.profit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
