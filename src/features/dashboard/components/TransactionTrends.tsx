
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

interface TransactionTrendsProps {
  data: any[];
  currency: string;
}

export const TransactionTrends = ({ data, currency }: TransactionTrendsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Tendance des Transactions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" tickFormatter={(value) => {
                return new Date(value).toLocaleDateString('fr-FR', { month: 'short' });
              }} />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`${value.toLocaleString()} ${currency}`, '']}
                labelFormatter={(label) => new Date(label).toLocaleDateString('fr-FR')}
              />
              <Legend />
              <Line 
                type="monotone" 
                name="Versements"
                dataKey="total_deposits" 
                stroke="#10B981" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                name="Retraits"
                dataKey="total_withdrawals" 
                stroke="#EF4444" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
