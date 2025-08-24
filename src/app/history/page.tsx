'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Header } from '@/components/layout/Header';
import { SessionDetailModal } from '@/components/history/SessionDetailModal';
import { 
  CalendarDays, 
  Search, 
  Filter, 
  Star, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  MessageSquare,
  TrendingUp,
  Clock,
  Target
} from 'lucide-react';
import { FeedbackData } from '@/types/feedback';

interface PracticeSessionDetail {
  id: string;
  topic: string;
  goal: string;
  mainPoints: string[];
  pitch: string;
  score: number;
  feedback: FeedbackData;
  createdAt: string;
  date: string;
}

interface HistoryResponse {
  sessions: PracticeSessionDetail[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  filters: {
    dateFrom: string | null;
    dateTo: string | null;
    minScore: number | null;
    maxScore: number | null;
  };
  summary: {
    totalSessions: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
  };
}

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const [sessions, setSessions] = useState<PracticeSessionDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<PracticeSessionDetail | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Pagination & filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minScore, setMinScore] = useState('');
  const [maxScore, setMaxScore] = useState('');
  const [summary, setSummary] = useState({
    totalSessions: 0,
    averageScore: 0,
    highestScore: 0,
    lowestScore: 0,
  });

  const fetchHistory = async (page = 1, filters = {}) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...filters,
      });

      const response = await fetch(`/api/user/history?${queryParams}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch history');
      }

      const data: HistoryResponse = await response.json();
      setSessions(data.sessions);
      setCurrentPage(data.pagination.currentPage);
      setTotalPages(data.pagination.totalPages);
      setTotalCount(data.pagination.totalCount);
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      window.location.href = '/auth/login';
      return;
    }

    fetchHistory();
  }, [session, status]);

  const handleFilter = () => {
    const filters: any = {};
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    if (minScore) filters.minScore = minScore;
    if (maxScore) filters.maxScore = maxScore;
    
    setCurrentPage(1);
    fetchHistory(1, filters);
  };

  const handleClearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setMinScore('');
    setMaxScore('');
    setCurrentPage(1);
    fetchHistory(1, {});
  };

  const handlePageChange = (page: number) => {
    const filters: any = {};
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    if (minScore) filters.minScore = minScore;
    if (maxScore) filters.maxScore = maxScore;
    
    fetchHistory(page, filters);
  };

  const openSessionDetail = (session: PracticeSessionDetail) => {
    setSelectedSession(session);
    setModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 6) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getScoreTrend = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (status === 'loading' || (loading && sessions.length === 0)) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container max-w-6xl mx-auto py-8 px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Practice History</h1>
            <p className="text-muted-foreground mt-2">Loading your practice sessions...</p>
          </div>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container max-w-6xl mx-auto py-8 px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Practice History</h1>
            <p className="text-muted-foreground mt-2">Review your past practice sessions</p>
          </div>
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => fetchHistory()} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Practice History</h1>
        <p className="text-muted-foreground mt-2">
          Review your past practice sessions and track your progress
        </p>
      </div>

      {/* Summary Cards */}
      {totalCount > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                  <p className="text-2xl font-semibold">{summary.totalSessions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Average Score</p>
                  <p className={`text-2xl font-semibold ${getScoreTrend(summary.averageScore)}`}>
                    {summary.averageScore}/10
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Best Score</p>
                  <p className={`text-2xl font-semibold ${getScoreTrend(summary.highestScore)}`}>
                    {summary.highestScore}/10
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Sessions This Month</p>
                  <p className="text-2xl font-semibold">
                    {sessions.filter(s => {
                      const sessionDate = new Date(s.createdAt);
                      const now = new Date();
                      return sessionDate.getMonth() === now.getMonth() && 
                             sessionDate.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minScore">Min Score</Label>
              <Select value={minScore} onValueChange={setMinScore}>
                <SelectTrigger>
                  <SelectValue placeholder="Min" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                    <SelectItem key={score} value={score.toString()}>
                      {score}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxScore">Max Score</Label>
              <Select value={maxScore} onValueChange={setMaxScore}>
                <SelectTrigger>
                  <SelectValue placeholder="Max" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                    <SelectItem key={score} value={score.toString()}>
                      {score}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleFilter} className="flex-1">
                <Search className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button onClick={handleClearFilters} variant="outline">
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Practice Sessions</CardTitle>
          <CardDescription>
            {totalCount > 0 
              ? `Showing ${sessions.length} of ${totalCount} sessions`
              : 'No practice sessions found'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No sessions found</h3>
              <p className="text-muted-foreground mb-4">
                {totalCount === 0 
                  ? "You haven't completed any practice sessions yet."
                  : "No sessions match your current filters."
                }
              </p>
              <Button asChild>
                <a href="/practice">Start Your First Session</a>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <Card key={session.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold line-clamp-1">{session.topic}</h3>
                          <Badge className={`${getScoreColor(session.score)} font-semibold`}>
                            <Star className="h-3 w-3 mr-1" />
                            {session.score}/10
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {formatDate(session.createdAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(session.createdAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {session.goal}
                        </p>
                      </div>
                      <Button
                        onClick={() => openSessionDetail(session)}
                        variant="outline"
                        size="sm"
                        className="ml-4"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Detail Modal */}
      <SessionDetailModal
        session={selectedSession}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedSession(null);
        }}
      />
      </div>
    </div>
  );
}