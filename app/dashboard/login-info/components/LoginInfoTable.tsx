'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { HotelPlatform } from '@/app/types';
import { PlatformFormData, PlatformListResponse } from './types';
import PlatformModal from './PlatformModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Loader2, RefreshCw, Eye, EyeOff, MoreHorizontal, Edit, Trash2, Plus, Search, X } from 'lucide-react';

export default function LoginInfoTable() {
  const [platforms, setPlatforms] = useState<HotelPlatform[]>([]);
  const [filteredPlatforms, setFilteredPlatforms] = useState<HotelPlatform[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<(PlatformFormData & { id: number }) | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [platformToDelete, setPlatformToDelete] = useState<HotelPlatform | null>(null);
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  
  const { data: session } = useSession();

  useEffect(() => {
    fetchPlatforms();
  }, [currentPage]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = platforms.filter(platform => 
        getPlatformName(platform.platform).toLowerCase().includes(searchTerm.toLowerCase()) ||
        platform.hotel_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        platform.login_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getStatusName(platform.status).toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPlatforms(filtered);
    } else {
      setFilteredPlatforms(platforms);
    }
  }, [platforms, searchTerm]);

  const fetchPlatforms = async () => {
    if (!session?.accessToken) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/hotel-platforms?page=${currentPage}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = '데이터를 가져올 수 없습니다.';
        
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

      const platformData = data as PlatformListResponse;
      setPlatforms(platformData.items);
      setTotalPages(platformData.total_pages);
      setTotalItems(platformData.total);
      setHasNext(platformData.has_next);
      setHasPrev(platformData.has_prev);
    } catch (error) {
      setError('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlatformDetails = async (platformId: number): Promise<HotelPlatform | null> => {
    if (!session?.accessToken) return null;

    try {
      const response = await fetch(`/api/hotel-platforms/${platformId}`, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) return null;
      
      return await response.json();
    } catch (error) {
      return null;
    }
  };

  const handleEdit = async (platform: HotelPlatform) => {
    // 비밀번호 포함된 상세 정보 가져오기
    const detailPlatform = await fetchPlatformDetails(platform.id);
    if (detailPlatform) {
      setEditingPlatform({
        id: detailPlatform.id,
        platform: detailPlatform.platform,
        login_id: detailPlatform.login_id,
        login_password: detailPlatform.login_password || '',
        hotel_name: detailPlatform.hotel_name,
        mfa_id: detailPlatform.mfa_id || '',
        mfa_password: detailPlatform.mfa_password || '',
        mfa_platform: detailPlatform.mfa_platform || '',
        status: detailPlatform.status || 'active',
      });
      setIsModalOpen(true);
    }
  };

  const handleDelete = (platform: HotelPlatform) => {
    setPlatformToDelete(platform);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!session?.accessToken || !platformToDelete) return;

    try {
      setDeletingId(platformToDelete.id);
      const response = await fetch(`/api/hotel-platforms/${platformToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        let errorMessage = '삭제 중 오류가 발생했습니다.';
        
        if (data.detail) {
          if (typeof data.detail === 'string') {
            errorMessage = data.detail;
          }
        } else if (data.error) {
          if (typeof data.error === 'string') {
            errorMessage = data.error;
          }
        }
        
        setError(errorMessage);
        return;
      }

      await fetchPlatforms(); // 목록 새로고침
      setIsDeleteModalOpen(false);
      setPlatformToDelete(null);
    } catch (error) {
      setError('서버 오류가 발생했습니다.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setPlatformToDelete(null);
  };

  const handleModalSuccess = () => {
    fetchPlatforms(); // 목록 새로고침
    setEditingPlatform(null);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingPlatform(null);
  };

  const handleSearch = () => {
    // 검색 시 첫 페이지로 이동
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getPlatformName = (platform: string) => {
    const platformNames: { [key: string]: string } = {
      'YANOLJA': '야놀자',
      'GOOD_CHOICE': '여기어때_사장님',
      'GOOD_CHOICE_HOTEL': '여기어때_파트너',
      'NAVER': '네이버',
      'AIR_BNB': '에어비앤비',
      'AGODA': '아고다',
      'BOOKING_HOLDINGS': '부킹닷컴',
      'EXPEDIA': '익스피디아',
      // 기존 값들도 호환성을 위해 유지
      'booking_com': '부킹닷컴',
      'agoda': '아고다',
      'expedia': '익스피디아',
      'hotels_com': '호텔스닷컴',
      'trip_com': '트립닷컴',
      'yanolja': '야놀자',
      'goodchoice': '여기어때',
      'airbnb': '에어비앤비',
      'naver': '네이버',
    };
    return platformNames[platform] || platform;
  };

  const getStatusName = (status: string) => {
    const statusNames: { [key: string]: string } = {
      'active': '활성',
      'inactive': '비활성',
    };
    return statusNames[status] || status;
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const togglePasswordVisibility = (platformId: string, field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [`${platformId}-${field}`]: !prev[`${platformId}-${field}`]
    }));
  };

  const getPlatformBadgeVariant = (platform: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      'YANOLJA': 'default',
      'GOOD_CHOICE': 'secondary',
      'GOOD_CHOICE_HOTEL': 'outline',
      'NAVER': 'default',
      'AIR_BNB': 'secondary',
      'AGODA': 'outline',
      'BOOKING_HOLDINGS': 'default',
      'EXPEDIA': 'secondary',
      // 기존 값들도 호환성을 위해 유지
      'booking_com': 'default',
      'agoda': 'secondary',
      'expedia': 'outline',
      'hotels_com': 'default',
      'trip_com': 'secondary',
      'yanolja': 'outline',
      'goodchoice': 'default',
      'airbnb': 'secondary',
      'naver': 'outline',
    };
    return variants[platform] || 'outline';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">데이터를 불러오는 중...</p>
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
              onClick={fetchPlatforms}
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
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => setIsModalOpen(true)}
                size="sm"
                className="h-10 w-full sm:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                로그인 정보 추가
              </Button>
            </div>
          </div>

          {/* 검색 섹션 */}
          <div className="pt-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <label htmlFor="search" className="text-sm font-medium leading-none">
                  검색
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="플랫폼명, 호텔명, 로그인 ID, 상태로 검색하세요"
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
              <div className="flex flex-col sm:flex-row lg:items-end space-y-2 sm:space-y-0 sm:space-x-2">
                <Button onClick={handleSearch} className="h-10 w-full sm:w-auto">
                  <Search className="h-4 w-4 mr-2" />
                  검색
                </Button>
                {searchTerm && (
                  <Button onClick={handleClearSearch} variant="outline" className="h-10 w-full sm:w-auto">
                    <X className="h-4 w-4 mr-2" />
                    초기화
                  </Button>
                )}
              </div>
            </div>
            {searchTerm && (
              <div className="mt-3 text-sm text-muted-foreground">
                <span className="font-medium">'{searchTerm}'</span>에 대한 검색 결과
              </div>
            )}
          </div>

          {/* 페이지네이션 정보 */}
          <div className="pt-4">
            <div className="text-sm text-muted-foreground">
              전체 {totalItems}개 중 {((currentPage - 1) * 10) + 1}-{Math.min(currentPage * 10, totalItems)}개 표시
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPlatforms.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm ? '검색 결과가 없습니다.' : '등록된 플랫폼 정보가 없습니다.'}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => setIsModalOpen(true)}
                  variant="outline"
                  className="mt-4"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  첫 번째 플랫폼 추가하기
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">플랫폼</TableHead>
                      <TableHead className="text-center">상태</TableHead>
                      <TableHead className="text-center">로그인 ID</TableHead>
                      <TableHead className="text-center">로그인 비밀번호</TableHead>
                      <TableHead className="text-center">호텔명</TableHead>
                      <TableHead className="text-center">MFA ID</TableHead>
                      <TableHead className="text-center">MFA 비밀번호</TableHead>
                      <TableHead className="text-center">MFA 플랫폼</TableHead>
                      <TableHead className="w-[50px] text-center">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPlatforms.map((platform) => (
                      <TableRow key={platform.id}>
                        <TableCell className="text-center">
                          <Badge variant={getPlatformBadgeVariant(platform.platform)}>
                            {getPlatformName(platform.platform)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={getStatusBadgeVariant(platform.status || 'active')}>
                            {getStatusName(platform.status || 'active')}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm text-center">
                          {platform.login_id}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <span className="font-mono text-sm">
                              {showPasswords[`${platform.id}-login`] 
                                ? platform.login_password || '••••••••'
                                : '••••••••'
                              }
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => togglePasswordVisibility(platform.id.toString(), 'login')}
                            >
                              {showPasswords[`${platform.id}-login`] 
                                ? <EyeOff className="h-3 w-3" />
                                : <Eye className="h-3 w-3" />
                              }
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-center">
                          {platform.hotel_name}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-center">
                          {platform.mfa_id || <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell className="text-center">
                          {platform.mfa_password ? (
                            <div className="flex items-center justify-center space-x-2">
                              <span className="font-mono text-sm">
                                {showPasswords[`${platform.id}-mfa`] 
                                  ? platform.mfa_password
                                  : '••••••••'
                                }
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => togglePasswordVisibility(platform.id.toString(), 'mfa')}
                              >
                                {showPasswords[`${platform.id}-mfa`] 
                                  ? <EyeOff className="h-3 w-3" />
                                  : <Eye className="h-3 w-3" />
                                }
                              </Button>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {platform.mfa_platform ? (
                            <Badge variant="outline" className="text-xs">
                              {platform.mfa_platform}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                disabled={deletingId === platform.id}
                              >
                                {deletingId === platform.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <MoreHorizontal className="h-4 w-4" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(platform)}>
                                <Edit className="mr-2 h-4 w-4" />
                                수정
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(platform)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                삭제
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
      </Card>

      <PlatformModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        editingPlatform={editingPlatform}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
        platformName={platformToDelete ? getPlatformName(platformToDelete.platform) : ''}
        hotelName={platformToDelete ? platformToDelete.hotel_name : ''}
      />
    </>
  );
} 