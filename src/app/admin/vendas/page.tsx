'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { Api } from '@/lib/apiHandler';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HandCoins, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Definição de tipos
interface ProductItem {
  id: string;
  idOrder: number;
  idProduct: number;
  codeProduct: string;
  nameProduct: string;
  quantityProduct: number;
  priceProduct: number;
}

interface Influencer {
  id: string;
  cpf: string;
  cnpj: string;
  fullName: string;
  phone: string;
  entryDate: string;
  codeCoupon: string;
  email: string;
  leader: string;
  manager: string;
  active: boolean;
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  streetAddress: string;
  numberAddress: string;
}

interface Sale {
  priceSale: number;
  commission: number;
  dateSale: string;
  influencer: Influencer;
  orderId: number;
  itemsSales: ProductItem[];
}

export default function VendasPage() {
  const { sessionId } = useAuthStore();
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Parâmetros de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('dateSale+desc');

  const {
    data: allSales,
    isLoading,
    isError,
    refetch,
  } = useQuery<Sale[]>({
    queryKey: ['sales'],
    queryFn: async () => {
      const response = await Api.get('/items-sales/sales', {
        headers: {
          'Session-Id': sessionId || '',
        },
      });
      return response.data;
    },
    enabled: !!sessionId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Ordenação e paginação no front-end
  const sortedAndPaginatedSales = useMemo(() => {
    if (!allSales) return { paginatedSales: [], totalItems: 0, totalPages: 0 };

    // Ordenação
    const [field, direction] = orderBy.split('+');
    const sorted = [...allSales].sort((a, b) => {
      let valueA, valueB;

      if (field === 'dateSale') {
        valueA = new Date(a.dateSale).getTime();
        valueB = new Date(b.dateSale).getTime();
      } else if (field === 'priceSale') {
        valueA = a.priceSale;
        valueB = b.priceSale;
      } else if (field === 'commission') {
        valueA = a.commission;
        valueB = b.commission;
      } else {
        valueA = a[field as keyof Sale];
        valueB = b[field as keyof Sale];
      }

      return direction === 'asc'
        ? valueA > valueB
          ? 1
          : -1
        : valueA < valueB
        ? 1
        : -1;
    });

    // Paginação
    const totalItems = sorted.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedSales = sorted.slice(startIndex, startIndex + itemsPerPage);

    return { paginatedSales, totalItems, totalPages };
  }, [allSales, orderBy, currentPage, itemsPerPage]);

  const handleRowClick = (sale: Sale) => {
    setSelectedSale(sale);
    setIsModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      return 'Data inválida';
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  const getProductNames = (items: ProductItem[]) => {
    if (!items || items.length === 0) return 'Sem produtos';

    const names = items.map((item) => item.nameProduct).join(', ');
    return truncateText(names, 30);
  };

  const handleNextPage = () => {
    if (currentPage < sortedAndPaginatedSales.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Volta para a primeira página ao mudar itens por página
  };

  const handleOrderByChange = (value: string) => {
    setOrderBy(value);
    setCurrentPage(1); // Volta para a primeira página ao mudar ordenação
  };

  // Dados para exibição
  const { paginatedSales, totalItems, totalPages } = sortedAndPaginatedSales;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="container py-10 mx-auto w-[95%]">
      <Card>
        <CardHeader>
          <CardTitle>Vendas</CardTitle>
          <CardDescription>
            Lista de todas as vendas realizadas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros e ordenação */}
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex gap-2">
              <Select value={orderBy} onValueChange={handleOrderByChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dateSale+desc">Data (recente)</SelectItem>
                  <SelectItem value="dateSale+asc">Data (antiga)</SelectItem>
                  <SelectItem value="priceSale+desc">Valor (maior)</SelectItem>
                  <SelectItem value="priceSale+asc">Valor (menor)</SelectItem>
                  <SelectItem value="commission+desc">
                    Comissão (maior)
                  </SelectItem>
                  <SelectItem value="commission+asc">
                    Comissão (menor)
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={itemsPerPage.toString()}
                onValueChange={handleItemsPerPageChange}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Itens" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center p-8">
              <p className="text-red-500">
                Erro ao carregar dados. Tente novamente.
              </p>
              <Button onClick={() => refetch()} className="mt-2">
                Tentar novamente
              </Button>
            </div>
          ) : (
            <>
              {/* Tabela para desktop */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pedido</TableHead>
                      <TableHead>Produtos</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Comissão</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Influencer</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSales.length > 0 ? (
                      paginatedSales.map((sale) => (
                        <TableRow
                          key={sale.orderId}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleRowClick(sale)}
                        >
                          <TableCell className="font-medium">
                            #{sale.orderId}
                          </TableCell>
                          <TableCell>
                            {getProductNames(sale.itemsSales)}
                          </TableCell>
                          <TableCell>R$ {sale.priceSale.toFixed(2)}</TableCell>
                          <TableCell>R$ {sale.commission.toFixed(2)}</TableCell>
                          <TableCell>{formatDate(sale.dateSale)}</TableCell>
                          <TableCell>
                            {truncateText(sale.influencer.fullName, 20)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Nenhuma venda encontrada.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Cards para mobile */}
              <div className="grid gap-4 md:hidden">
                {paginatedSales.length > 0 ? (
                  paginatedSales.map((sale) => (
                    <Card
                      key={sale.orderId}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(sale)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-medium">Pedido #{sale.orderId}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(sale.dateSale)}
                          </p>
                        </div>
                        <p className="text-sm mb-1 line-clamp-2">
                          {getProductNames(sale.itemsSales)}
                        </p>
                        <div className="flex justify-between mt-2">
                          <p className="text-sm font-medium">
                            R$ {sale.priceSale.toFixed(2)}
                          </p>
                          <p className="text-sm text-green-600">
                            Comissão: R$ {sale.commission.toFixed(2)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    Nenhuma venda encontrada.
                  </div>
                )}
              </div>

              {/* Paginação */}
              {totalItems > 0 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {startItem} a {endItem} de {totalItems} resultados
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="sr-only">Página anterior</span>
                    </Button>
                    <div className="text-sm">
                      Página {currentPage} de {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage >= totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">Próxima página</span>
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalhes */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Detalhes da Venda <HandCoins className="text-primary" size={20} />
            </DialogTitle>
            <DialogDescription>
              Informações completas sobre a venda.
            </DialogDescription>
          </DialogHeader>

          {selectedSale && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Pedido</p>
                  <p className="font-medium">#{selectedSale.orderId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="font-medium">
                    {formatDate(selectedSale.dateSale)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="font-medium">
                    R$ {selectedSale.priceSale.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Comissão</p>
                  <p className="font-medium text-green-600">
                    R$ {selectedSale.commission.toFixed(2)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Influencer</p>
                <Card className="p-3">
                  <p className="font-medium">
                    {selectedSale.influencer.fullName}
                  </p>
                  <p className="text-sm">{selectedSale.influencer.email}</p>
                  <p className="text-sm">
                    Cupom: {selectedSale.influencer.codeCoupon}
                  </p>
                </Card>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Produtos</p>
                <div className="space-y-2">
                  {selectedSale.itemsSales.map((item) => (
                    <Card key={item.id} className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{item.nameProduct}</p>
                          <p className="text-sm">Código: {item.codeProduct}</p>
                          <p className="text-sm">
                            Quantidade: {item.quantityProduct}
                          </p>
                        </div>
                        <p className="font-medium">
                          R$ {item.priceProduct.toFixed(2)}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsModalOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
