'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, BarChart3, Calendar, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressChartProps {
  data: Array<{
    score: number;
    date: string;
    topic: string;
  }>;
  className?: string;
  showTrend?: boolean;
  chartType?: 'line' | 'area';
  timeRange?: '7d' | '30d' | '90d';
}

export function ProgressChart({ 
  data = [],
  className,
  showTrend = true,
  chartType = 'area',
  timeRange = '30d'
}: ProgressChartProps) {
  // Process data for chart
  const processedData = data
    .slice(-30) // Show last 30 sessions max
    .map((session, index) => ({
      ...session,
      sessionNumber: index + 1,
      formattedDate: new Date(session.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }),
      shortTopic: session.topic.length > 20 
        ? session.topic.substring(0, 20) + '...' 
        : session.topic
    }));

  // Calculate trend
  const calculateTrend = () => {
    if (processedData.length < 2) return null;
    
    const recent = processedData.slice(-5);
    const older = processedData.slice(0, -5).slice(-5);
    
    if (recent.length === 0 || older.length === 0) return null;
    
    const recentAvg = recent.reduce((sum, d) => sum + d.score, 0) / recent.length;
    const olderAvg = older.reduce((sum, d) => sum + d.score, 0) / older.length;
    
    return {
      change: recentAvg - olderAvg,
      direction: recentAvg > olderAvg ? 'up' : recentAvg < olderAvg ? 'down' : 'stable'
    };
  };

  const trend = calculateTrend();

  // Calculate statistics
  const stats = processedData.length > 0 ? {
    highest: Math.max(...processedData.map(d => d.score)),
    lowest: Math.min(...processedData.map(d => d.score)),
    average: processedData.reduce((sum, d) => sum + d.score, 0) / processedData.length,
    latest: processedData[processedData.length - 1]?.score || 0
  } : null;

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="text-sm font-semibold">{`Score: ${data.score}/10`}</p>
          <p className="text-xs text-muted-foreground">{data.formattedDate}</p>
          <p className="text-xs text-muted-foreground mt-1">{data.shortTopic}</p>
        </div>
      );
    }
    return null;
  };

  const getTrendBadge = () => {
    if (!trend || !showTrend) return null;
    
    const { change, direction } = trend;
    const absChange = Math.abs(change);
    
    if (absChange < 0.3) {
      return (
        <Badge variant="outline" className="text-gray-600">
          <TrendingUp className="h-3 w-3 mr-1 rotate-90" />
          Stable
        </Badge>
      );
    }
    
    if (direction === 'up') {
      return (
        <Badge variant="outline" className="text-green-600">
          <TrendingUp className="h-3 w-3 mr-1" />
          +{change.toFixed(1)}
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="text-red-600">
        <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
        {change.toFixed(1)}
      </Badge>
    );
  };

  if (processedData.length === 0) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Progress Over Time
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex flex-col items-center justify-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
          <div className="text-center space-y-2">
            <h3 className="font-semibold">No Data Available</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Complete a few practice sessions to see your progress chart and track improvement over time.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Progress Over Time
          </div>
          <div className="flex items-center gap-2">
            {getTrendBadge()}
            <Badge variant="outline" className="text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              Last {processedData.length} sessions
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Statistics Row */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Latest</div>
              <div className={cn(
                "font-semibold",
                stats.latest >= 8 ? "text-green-600" :
                stats.latest >= 6 ? "text-yellow-600" :
                "text-red-600"
              )}>
                {stats.latest}/10
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Average</div>
              <div className="font-semibold">{stats.average.toFixed(1)}/10</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Highest</div>
              <div className="font-semibold text-green-600">{stats.highest}/10</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Lowest</div>
              <div className="font-semibold text-red-600">{stats.lowest}/10</div>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={processedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="sessionNumber" 
                  tick={{ fontSize: 12 }} 
                  className="text-muted-foreground"
                />
                <YAxis 
                  domain={[0, 10]} 
                  tick={{ fontSize: 12 }} 
                  className="text-muted-foreground"
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#scoreGradient)"
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
              </AreaChart>
            ) : (
              <LineChart data={processedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="sessionNumber" 
                  tick={{ fontSize: 12 }} 
                  className="text-muted-foreground"
                />
                <YAxis 
                  domain={[0, 10]} 
                  tick={{ fontSize: 12 }} 
                  className="text-muted-foreground"
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Trend Analysis */}
        {trend && showTrend && (
          <div className="border-t pt-4">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="text-sm">
                <div className="font-medium mb-1">Trend Analysis</div>
                <div className="text-muted-foreground">
                  {trend.direction === 'up' && (
                    <>Your recent scores show improvement with an average increase of {Math.abs(trend.change).toFixed(1)} points. Keep up the excellent work!</>
                  )}
                  {trend.direction === 'down' && (
                    <>Your recent scores have decreased by an average of {Math.abs(trend.change).toFixed(1)} points. Consider reviewing feedback from previous sessions to identify areas for improvement.</>
                  )}
                  {trend.direction === 'stable' && (
                    <>Your scores are consistent, showing stable performance. Try challenging yourself with more complex scenarios to continue growing.</>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}