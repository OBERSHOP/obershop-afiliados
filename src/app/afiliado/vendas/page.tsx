'use client';

import { useState, useMemo } from 'react';
import { useAffiliateSales } from '@/hooks/useAffiliateSales';
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
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProductItem {
  id: string;
  idOrder: number;
  idProduct: number;
  codeProduct: string;
  nameProduct: string;
  quantityProduct: number;
  priceProduct: number;
}

interface Sale {
  orderId: number;
  priceSale: number;
  commission: number;
  dateSale: string;
  itemsSales: ProductItem[];
}

export default function VendasPage() {
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('dateSale+desc');

  const {
    data: sales = [],
    isLoading,
    isError,
    refetch,
  } = useAffiliateSales();

  const summary = useMemo(() => {
    const totalVendas = sales.length;
    const totalValor = sales.reduce((acc, sale) => acc + sale.priceSale, 0);
    const totalComissao = sales.reduce((acc, sale) => acc + sale.commission, 0);
    return { totalVendas, totalValor, totalComissao };
  }, [sales]);

  const { paginatedSales, totalPages } = useMemo(() => {
    const [field, direction] = orderBy.split('+');
    const sorted = [...sales].sort((a, b) => {
      const dateA = new Date(a.dateSale).getTime();
      const dateB = new Date(b.dateSale).getTime();
      if (field === 'dateSale') return direction === 'asc' ? dateA - dateB : dateB - dateA;
      if (field === 'priceSale') return direction === 'asc' ? a.priceSale - b.priceSale : b.priceSale - a.priceSale;
      if (field === 'commission') return direction === 'asc' ? a.commission - b.commission : b.commission - a.commission;
      return 0;
    });

    const totalItems = sorted.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedSales = sorted.slice(startIndex, startIndex + itemsPerPage);

    return { paginatedSales, totalItems, totalPages };
  }, [sales, orderBy, currentPage, itemsPerPage]);

  const handleRowClick = (sale: Sale) => {
    setSelectedSale(sale);
    setIsModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="container mx-auto py-6 space-y-6 w-[95%]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingBag className="h-6 w-6" />
            Minhas Vendas
          </h1>
          <p className="text-muted-foreground">
            Acompanhe todas as vendas realizadas com seu cupom
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total de Vendas</p><p className="text-2xl font-bold">{summary.totalVendas}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Valor Total</p><p className="text-2xl font-bold">R$ {summary.totalValor.toFixed(2)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total de Comissões</p><p className="text-2xl font-bold text-green-600">R$ {summary.totalComissao.toFixed(2)}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <CardTitle>Histórico de Vendas</CardTitle>
          <CardDescription>
            Todas as vendas realizadas com seu cupom de desconto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
            <Select value={orderBy} onValueChange={setOrderBy}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Ordenar por" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dateSale+desc">Data (mais recente)</SelectItem>
                <SelectItem value="dateSale+asc">Data (mais antiga)</SelectItem>
                <SelectItem value="priceSale+desc">Valor (maior)</SelectItem>
                <SelectItem value="priceSale+asc">Valor (menor)</SelectItem>
                <SelectItem value="commission+desc">Comissão (maior)</SelectItem>
                <SelectItem value="commission+asc">Comissão (menor)</SelectItem>
              </SelectContent>
            </Select>
            <Select value={itemsPerPage.toString()} onValueChange={(value) => { setItemsPerPage(Number(value)); setCurrentPage(1); }}>
              <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 itens</SelectItem>
                <SelectItem value="10">10 itens</SelectItem>
                <SelectItem value="20">20 itens</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : isError ? (
            <div className="text-center p-8">
              <p className="text-red-500">Erro ao carregar dados.</p>
              <Button onClick={() => refetch()} className="mt-2">Tentar novamente</Button>
            </div>
          ) : (
            <>
              <Table className="hidden md:table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Comissão</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSales.map((sale) => (
                    <TableRow key={sale.orderId} className="cursor-pointer" onClick={() => handleRowClick(sale)}>
                      <TableCell>#{sale.orderId}</TableCell>
                      <TableCell>{formatDate(sale.dateSale)}</TableCell>
                      <TableCell>R$ {sale.priceSale.toFixed(2)}</TableCell>
                      <TableCell className="text-green-600">R$ {sale.commission.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                  <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">Página {currentPage} de {totalPages}</span>
                  <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Detalhes da Venda
            </DialogTitle>
            <DialogDescription>
              Informações detalhadas sobre a venda selecionada
            </DialogDescription>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-muted-foreground">Pedido</p><p className="font-medium">#{selectedSale.orderId}</p></div>
                <div><p className="text-sm text-muted-foreground">Data</p><p className="font-medium">{formatDate(selectedSale.dateSale)}</p></div>
                <div><p className="text-sm text-muted-foreground">Valor</p><p className="font-medium">R$ {selectedSale.priceSale.toFixed(2)}</p></div>
                <div><p className="text-sm text-muted-foreground">Comissão</p><p className="font-medium text-green-600">R$ {selectedSale.commission.toFixed(2)}</p></div>
              </div>
              <div className="border-t pt-4">
                <p className="font-medium mb-2">Produtos</p>
                <div className="space-y-2">
                  {selectedSale.itemsSales.map(item => (
                    <div key={item.id} className="bg-muted/50 p-3 rounded-md">
                      <div className="flex justify-between">
                        <p className="font-medium">{item.nameProduct}</p>
                        <p>R$ {item.priceProduct.toFixed(2)}</p>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <p>Código: {item.codeProduct}</p>
                        <p>Qtd: {item.quantityProduct}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setIsModalOpen(false)}>Fechar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
