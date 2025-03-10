
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

interface MonthlyData {
  day: string;
  deposits_count?: number;
  withdrawals_count?: number;
  transfer_count?: number;
  total_amount?: number;
  total_deposits?: number;
  total_withdrawals?: number;
}

interface TransactionTrendsProps {
  data: MonthlyData[];
  currency: string;
}

export const TransactionTrends = ({ data, currency }: TransactionTrendsProps) => {
  // Ensure we have data to display
  const safeData = Array.isArray(data) ? data : [];
  
  // Format data for chart display
  const formattedData = safeData.map(item => ({
    ...item,
    day: item.day || '',
    total_deposits: typeof item.total_deposits === 'number' ? item.total_deposits : 0,
    total_withdrawals: typeof item.total_withdrawals === 'number' ? item.total_withdrawals : 0
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Tendance des Transactions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {formattedData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Aucune donnée de transaction disponible
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="day" 
                  tickFormatter={(value) => {
                    // Handle various date formats or use the value as is if it's not a date
                    try {
                      return new Date(value).toLocaleDateString('fr-FR', { month: 'short' });
                    } catch (e) {
                      return value;
                    }
                  }} 
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`${value.toLocaleString()} ${currency}`, '']}
                  labelFormatter={(label) => {
                    try {
                      return new Date(label).toLocaleDateString('fr-FR');
                    } catch (e) {
                      return label;
                    }
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  name="Versements"
                  dataKey="total_deposits" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                  isAnimationActive={true}
                />
                <Line 
                  type="monotone" 
                  name="Retraits"
                  dataKey="total_withdrawals" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
