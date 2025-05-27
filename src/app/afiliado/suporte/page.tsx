'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  FileText,
  Video,
  Calendar,
  Image as ImageIcon,
} from 'lucide-react';
import NextImage from 'next/image';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Tipos
interface Category {
  id: string;
  name: string;
}

interface SupportItem {
  id: string;
  name: string;
  category: Category;
  urlImage?: string;
  price: number;
  urlVideo?: string;
  pdfFile?: string;
  description?: string;
  createdAt: string;
}

export default function SuportePage() {
  const { sessionId } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<SupportItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Dados mockados para exemplo
  const mockCategories: Category[] = [
    { id: '1', name: 'Roupas' },
    { id: '2', name: 'Acessórios' },
    { id: '3', name: 'Calçados' },
    { id: '4', name: 'Eletrônicos' },
    { id: '5', name: 'Cosméticos' },
  ];

  const mockSupportItems: SupportItem[] = [
    {
      id: '1',
      name: 'Camiseta Premium',
      category: mockCategories[0],
      urlImage: '',
      price: 89.9,
      description:
        'Camiseta de algodão premium com estampa exclusiva. Disponível em vários tamanhos e cores. Material de alta qualidade e durabilidade.',
      createdAt: '2023-10-15T14:30:00Z',
    },
    {
      id: '2',
      name: 'Relógio Esportivo',
      category: mockCategories[1],
      urlImage: '',
      price: 299.9,
      urlVideo: '',
      description:
        'Relógio esportivo resistente à água com múltiplas funções. Ideal para atividades físicas.',
      createdAt: '2023-11-05T10:15:00Z',
    },
    {
      id: '3',
      name: 'Tênis Running',
      category: mockCategories[2],
      urlImage: '',
      price: 459.9,
      pdfFile: 'https://example.com/manual.pdf',
      description:
        'Tênis para corrida com tecnologia de amortecimento avançada. Confortável e leve.',
      createdAt: '2023-11-20T09:45:00Z',
    },
    {
      id: '4',
      name: 'Fone Bluetooth',
      category: mockCategories[3],
      urlImage: '',
      price: 199.9,
      urlVideo: 'https://example.com/video2.mp4',
      pdfFile: 'https://example.com/manual2.pdf',
      description:
        'Fone de ouvido bluetooth com cancelamento de ruído e bateria de longa duração.',
      createdAt: '2023-12-01T16:30:00Z',
    },
    {
      id: '5',
      name: 'Kit Skincare',
      category: mockCategories[4],
      urlImage: '',
      price: 189.9,
      description:
        'Kit completo de skincare com produtos para limpeza, hidratação e proteção da pele.',
      createdAt: '2023-12-10T11:20:00Z',
    },
  ];

  // Query para buscar itens de suporte
  const {
    data: supportItems = mockSupportItems,
    isLoading,
    isError,
    refetch,
  } = useQuery<SupportItem[]>({
    queryKey: ['support-items'],
    queryFn: async () => {
      // Em produção, substituir por chamada real à API
      // const response = await Api.get("/support/items", {
      //   headers: { "Session-Id": sessionId || "" },
      // });
      // return response.data;
      return mockSupportItems;
    },
    enabled: !!sessionId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar busca se necessário
  };

  const handleItemClick = (item: SupportItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  // Filtrar itens por termo de busca
  const filteredItems = supportItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description &&
        item.description.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  // Truncar texto
  const truncateText = (text: string | undefined, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      console.log(error)
      return 'Data inválida';
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Suporte de Produtos</CardTitle>
              <CardDescription>
                Acesse informações e materiais de suporte para os produtos
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filtro de busca */}
          <div className="flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar produto..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button type="submit" variant="outline">
                Buscar
              </Button>
            </form>
          </div>

          {/* Lista de itens */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="space-y-3">
                  <Skeleton className="h-[200px] w-full rounded-lg" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
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
          ) : filteredItems.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-muted-foreground">
                Nenhum item encontrado. Tente uma busca diferente.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <Card
                  key={item.id}
                  className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="relative h-[200px] w-full">
                    {item.urlImage && item.urlImage.trim() !== '' ? (
                      <div className="h-full w-full relative">
                        <NextImage
                          src={item.urlImage}
                          alt={item.name}
                          fill
                          unoptimized={item.urlImage.includes(
                            'placeholder.com',
                          )}
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                    ) : (
                      <div className="h-full w-full bg-muted flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-muted-foreground opacity-50" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                        R$ {item.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {truncateText(item.description || '', 100)}
                    </p>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(item.createdAt)}
                      </span>
                      <span className="bg-muted px-2 py-1 rounded-full">
                        {item.category.name}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes do Item */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {selectedItem.name}
                </DialogTitle>
                <DialogDescription>
                  Categoria: {selectedItem.category.name}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {selectedItem.urlImage &&
                selectedItem.urlImage.trim() !== '' ? (
                  <div className="relative h-[250px] w-full rounded-md overflow-hidden">
                    <NextImage
                      src={selectedItem.urlImage}
                      alt={selectedItem.name}
                      fill
                      unoptimized={selectedItem.urlImage.includes(
                        'placeholder.com',
                      )}
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ) : (
                  <div className="h-[250px] w-full rounded-md bg-muted flex items-center justify-center">
                    <ImageIcon className="h-16 w-16 text-muted-foreground opacity-50" />
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">
                    R$ {selectedItem.price.toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Adicionado em {formatDate(selectedItem.createdAt)}
                  </span>
                </div>

                {selectedItem.description && (
                  <div>
                    <h4 className="font-medium mb-1">Descrição</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedItem.description}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {selectedItem.pdfFile && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() =>
                        window.open(selectedItem.pdfFile, '_blank')
                      }
                    >
                      <FileText className="h-4 w-4" />
                      Manual PDF
                    </Button>
                  )}

                  {selectedItem.urlVideo && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() =>
                        window.open(selectedItem.urlVideo, '_blank')
                      }
                    >
                      <Video className="h-4 w-4" />
                      Ver Vídeo
                    </Button>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Fechar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
