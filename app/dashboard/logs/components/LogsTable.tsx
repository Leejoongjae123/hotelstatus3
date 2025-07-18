'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Log, LogListResponse, LogFilter } from './types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, RefreshCw, Search, X, Calendar, Clock, User, Building2, CreditCard, Eye } from 'lucide-react';

export default function LogsTable() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<LogFilter>({});
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  
  const { data: session } = useSession();

  useEffect(() => {
    fetchLogs();
  }, [currentPage, filter]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = logs.filter(log => 
        (log.ota_place_name && log.ota_place_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.guest_name && log.guest_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.reserve_no && log.reserve_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.accom_id && log.accom_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.room_reserve_id && log.room_reserve_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.platform && log.platform.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.description && log.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.error_message && log.error_message.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredLogs(filtered);
    } else {
      setFilteredLogs(logs);
    }
  }, [logs, searchTerm]);

  const fetchLogs = async () => {
    if (!session) {
      setError('로그인이 필요합니다.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(''); // 이전 에러 초기화
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(filter.agent && { agent: filter.agent }),
        ...(filter.result && { result: filter.result }),
        ...(filter.platform && { platform: filter.platform })
      });

      const response = await fetch(`/api/logs?${params}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = '로그 데이터를 가져올 수 없습니다.';
        
        if (data.error) {
          if (typeof data.error === 'string') {
            errorMessage = data.error;
          } else if (typeof data.error === 'object') {
            errorMessage = '서버에서 오류가 발생했습니다.';
          }
        }
        
        setError(errorMessage);
        return;
      }

      const logData = data as LogListResponse;
      setLogs(logData.items);
      setTotalPages(logData.total_pages);
      setTotalItems(logData.total);
      setHasNext(logData.has_next);
      setHasPrev(logData.has_prev);
    } catch (error) {
      setError('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // 검색은 useEffect에서 자동으로 처리됨
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRefresh = () => {
    fetchLogs();
  };

  const getAgentName = (agent: string) => {
    const agentMap: { [key: string]: string } = {
      'YANOLJA': '야놀자',
      'YEOGI_BOSS': '여기어때 사장님',
      'YEOGI_PARTNER': '여기어때 파트너',
      'NAVER': '네이버',
      'AIRBNB': '에어비앤비',
      'AGODA': '아고다',
      'BOOKING': '부킹닷컴',
      'EXPEDIA': '익스피디아'
    };
    return agentMap[agent] || agent;
  };

  const getResultBadgeVariant = (result: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (result) {
      case 'success':
        return 'default';
      case 'fail':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getResultName = (result: string) => {
    switch (result) {
      case 'success':
        return '성공';
      case 'fail':
        return '실패';
      default:
        return result || '-';
    }
  };

  const getDescriptionName = (description: string) => {
    const descriptionMap: { [key: string]: string } = {
      'LOGIN_FAIL': '로그인 실패',
      'PARSING_FAIL': '파싱 실패',
      'NETWORK_ERROR': '네트워크 에러',
      'EMPTY': '',
    };
    return descriptionMap[description] || description || '-';
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === null) return '-';
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(price);
  };

  const handleRowClick = (log: Log) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLog(null);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">로그를 불러오는 중...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="text-center space-y-4">
            <p className="text-destructive">{error}</p>
            <Button 
              onClick={handleRefresh}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              다시 시도
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          
          <Button
            onClick={handleRefresh}
            size="sm"
            className="h-8"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            새로고침
          </Button>
        </div>

        {/* 검색 및 필터 섹션 */}
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-10 gap-4">
            <div className="md:col-span-8 space-y-2">
              <label htmlFor="search" className="text-sm font-medium leading-none">
                로그 검색
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="호텔명, 게스트명, 예약번호, 숙소ID, 객실예약ID, 플랫폼, 설명, 오류 메시지로 검색하세요"
                  className="pl-10 pr-10"
                />
                {searchTerm && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-8 w-8 p-0"
                    onClick={handleClearSearch}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            <div className="md:col-span-1 space-y-2">
              <label className="text-sm font-medium leading-none">
                에이전트
              </label>
              <Select 
                value={filter.agent || 'ALL'} 
                onValueChange={(value) => setFilter(prev => ({ ...prev, agent: value === 'ALL' ? '' : value }))}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체</SelectItem>
                  <SelectItem value="YANOLJA">야놀자</SelectItem>
                  <SelectItem value="YEOGI_BOSS">여기어때 사장님</SelectItem>
                  <SelectItem value="YEOGI_PARTNER">여기어때 파트너</SelectItem>
                  <SelectItem value="NAVER">네이버</SelectItem>
                  <SelectItem value="AIRBNB">에어비앤비</SelectItem>
                  <SelectItem value="AGODA">아고다</SelectItem>
                  <SelectItem value="BOOKING">부킹닷컴</SelectItem>
                  <SelectItem value="EXPEDIA">익스피디아</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-1 space-y-2">
              <label className="text-sm font-medium leading-none">
                결과
              </label>
              <Select 
                value={filter.result || 'ALL'} 
                onValueChange={(value) => setFilter(prev => ({ ...prev, result: value === 'ALL' ? '' : value }))}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체</SelectItem>
                  <SelectItem value="success">성공</SelectItem>
                  <SelectItem value="fail">실패</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {searchTerm && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">'{searchTerm}'</span>에 대한 검색 결과: {filteredLogs.length}개
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? '검색 결과가 없습니다.' : '로그 데이터가 없습니다.'}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              시스템 활동이 시작되면 로그가 여기에 표시됩니다.
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center w-16">ID</TableHead>
                    <TableHead className="text-center">호텔명</TableHead>
                    <TableHead className="text-center">게스트명</TableHead>
                    <TableHead className="text-center">예약번호</TableHead>
                    <TableHead className="text-center">에이전트</TableHead>
                    <TableHead className="text-center">결과</TableHead>
                    <TableHead className="text-center">설명</TableHead>
                    <TableHead className="text-center">선결제</TableHead>
                    <TableHead className="text-center">수수료</TableHead>
                    <TableHead className="text-center">생성일시</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow 
                      key={log.id} 
                      className="hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleRowClick(log)}
                    >
                      <TableCell className="text-center font-medium">
                        {log.id}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>{log.ota_place_name || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{log.guest_name || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {log.reserve_no || '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        {log.agent ? (
                          <Badge variant="outline">
                            {getAgentName(log.agent)}
                          </Badge>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        {log.result ? (
                          <Badge variant={getResultBadgeVariant(log.result)}>
                            {getResultName(log.result)}
                          </Badge>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="max-w-32 truncate">
                          {log.description ? getDescriptionName(log.description) : (log.error_message || '-')}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span>{formatPrice(log.prepaid)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span>{formatPrice(log.fee)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formatDateTime(log.created_at)}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* 페이지네이션 */}
            <div className="flex justify-center mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={!hasPrev ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1).map((page) => {
                    // 현재 페이지 주변의 페이지들만 표시
                    const shouldShow = 
                      page === 1 || 
                      page === totalPages || 
                      (page >= currentPage - 2 && page <= currentPage + 2);
                    
                    if (!shouldShow && totalPages > 1) {
                      // 생략 표시
                      if (page === currentPage - 3 || page === currentPage + 3) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return null;
                    }

                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={currentPage === page}
                          className={`cursor-pointer ${
                            currentPage === page 
                              ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                              : 'bg-white hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={!hasNext ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </>
        )}
      </CardContent>

      {/* 상세 로그 모달 */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-full max-w-[60vw] sm:max-w-[75vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>로그 상세 정보</span>
            </DialogTitle>
            <DialogDescription>
              로그 ID: {selectedLog?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-6">
              {/* 기본 정보 */}
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center space-x-2">
                      <Building2 className="h-4 w-4" />
                      <span>호텔 정보</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">호텔명</label>
                      <p className="text-sm">{selectedLog.ota_place_name || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">플랫폼</label>
                      <p className="text-sm">{selectedLog.platform || '-'}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>예약 정보</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">게스트명</label>
                      <p className="text-sm">{selectedLog.guest_name || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">예약번호</label>
                      <p className="text-sm">{selectedLog.reserve_no || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">숙소 ID</label>
                      <p className="text-sm font-mono">{selectedLog.accom_id || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">객실 예약 ID</label>
                      <p className="text-sm font-mono">{selectedLog.room_reserve_id || '-'}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 처리 정보 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">처리 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">에이전트</label>
                      <div className="mt-1">
                        {selectedLog.agent ? (
                          <Badge variant="outline">
                            {getAgentName(selectedLog.agent)}
                          </Badge>
                        ) : '-'}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">처리 결과</label>
                      <div className="mt-1">
                        {selectedLog.result ? (
                          <Badge variant={getResultBadgeVariant(selectedLog.result)}>
                            {getResultName(selectedLog.result)}
                          </Badge>
                        ) : '-'}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">생성일시</label>
                      <div className="flex items-center space-x-1 mt-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{formatDateTime(selectedLog.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 금액 정보 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center space-x-2">
                    <CreditCard className="h-4 w-4" />
                    <span>금액 정보</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">선결제 금액</label>
                      <p className="text-lg font-semibold">{formatPrice(selectedLog.prepaid)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">수수료</label>
                      <p className="text-lg font-semibold">{formatPrice(selectedLog.fee)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 설명 및 오류 메시지 */}
              {(selectedLog.description || selectedLog.error_message) && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">상세 내용</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedLog.description && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">설명</label>
                        <p className="text-sm mt-1 p-3 bg-muted rounded-md">
                          {getDescriptionName(selectedLog.description)}
                        </p>
                      </div>
                    )}
                    {selectedLog.error_message && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">오류 메시지</label>
                        <p className="text-sm mt-1 p-3 bg-destructive/10 text-destructive rounded-md">
                          {selectedLog.error_message}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* 시스템 정보 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">시스템 정보</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">로그 ID</label>
                      <p className="font-mono">{selectedLog.id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">사용자 ID</label>
                      <p className="font-mono">{selectedLog.user_id || '-'}</p>
                    </div>
                    {selectedLog.created_at && (
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-muted-foreground">생성 시간 (원본)</label>
                        <p className="font-mono text-xs">{selectedLog.created_at}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
} 