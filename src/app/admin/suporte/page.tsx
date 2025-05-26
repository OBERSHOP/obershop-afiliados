'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  FileText,
  Video,
  Image as ImageIcon,
} from 'lucide-react';
import NextImage from 'next/image';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

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

// Schemas de validação
const categorySchema = z.object({
  name: z.string().min(3, 'Nome da categoria deve ter pelo menos 3 caracteres'),
});

const supportItemSchema = z.object({
  name: z.string().min(3, 'Nome do produto deve ter pelo menos 3 caracteres'),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  urlImage: z.string().optional().or(z.literal('')),
  price: z.coerce.number().min(0, 'Preço não pode ser negativo'),
  urlVideo: z.string().optional().or(z.literal('')),
  pdfFile: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
});

type CategoryFormValues = z.infer<typeof categorySchema>;
type SupportItemFormValues = z.infer<typeof supportItemSchema>;

export default function SuportePage() {
  const { sessionId } = useAuthStore();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<SupportItem | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Formulários
  const categoryForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
    },
  });

  const itemForm = useForm<SupportItemFormValues>({
    resolver: zodResolver(supportItemSchema),
    defaultValues: {
      name: '',
      categoryId: '',
      urlImage: '',
      price: 0,
      urlVideo: '',
      pdfFile: '',
      description: '',
    },
  });

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
      urlImage: 'https://via.placeholder.com/300x200',
      price: 89.9,
      description:
        'Camiseta de algodão premium com estampa exclusiva. Disponível em vários tamanhos e cores. Material de alta qualidade e durabilidade.',
      createdAt: '2023-10-15T14:30:00Z',
    },
    {
      id: '2',
      name: 'Relógio Esportivo',
      category: mockCategories[1],
      urlImage: 'https://via.placeholder.com/300x200',
      price: 299.9,
      urlVideo: 'https://example.com/video.mp4',
      description:
        'Relógio esportivo resistente à água com múltiplas funções. Ideal para atividades físicas.',
      createdAt: '2023-11-05T10:15:00Z',
    },
    {
      id: '3',
      name: 'Tênis Running',
      category: mockCategories[2],
      urlImage: 'https://via.placeholder.com/300x200',
      price: 459.9,
      pdfFile: 'https://example.com/manual.pdf',
      description:
        'Tênis para corrida com tecnologia de amortecimento avançada. Confortável e leve.',
      createdAt: '2023-11-20T16:45:00Z',
    },
    {
      id: '4',
      name: 'Smartphone X20',
      category: mockCategories[3],
      urlImage: 'https://via.placeholder.com/300x200',
      price: 1899.9,
      urlVideo: 'https://example.com/video.mp4',
      pdfFile: 'https://example.com/manual.pdf',
      description:
        'Smartphone com câmera de alta resolução, processador rápido e bateria de longa duração.',
      createdAt: '2023-12-01T09:30:00Z',
    },
    {
      id: '5',
      name: 'Kit Skincare',
      category: mockCategories[4],
      urlImage: 'https://via.placeholder.com/300x200',
      price: 189.9,
      description:
        'Kit completo de skincare com produtos para limpeza, hidratação e proteção da pele.',
      createdAt: '2023-12-10T11:20:00Z',
    },
  ];

  // Queries
  const { data: categories = mockCategories, isLoading: isCategoriesLoading } =
    useQuery<Category[]>({
      queryKey: ['support-categories'],
      queryFn: async () => {
        // Em produção, substituir por chamada real à API
        // const response = await Api.get("/support/categories", {
        //   headers: { "Session-Id": sessionId || "" },
        // });
        // return response.data;
        return mockCategories;
      },
      enabled: !!sessionId,
      staleTime: 1000 * 60 * 5, // 5 minutos
    });

  const {
    data: supportItems = mockSupportItems,
    isLoading: isItemsLoading,
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

  // Mutations
  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormValues) => {
      // Em produção, substituir por chamada real à API
      // const response = await Api.post("/support/categories", data, {
      //   headers: { "Session-Id": sessionId || "" },
      // });
      // return response.data;

      // Mock para exemplo
      return { id: `${Date.now()}`, name: data.name };
    },
    onSuccess: (newCategory) => {
      queryClient.setQueryData<Category[]>(
        ['support-categories'],
        (old = []) => [...old, newCategory],
      );
      toast.success('Categoria criada com sucesso!');
      setIsCategoryModalOpen(false);
      categoryForm.reset();
    },
    onError: () => {
      toast.error('Erro ao criar categoria. Tente novamente.');
    },
  });

  const createItemMutation = useMutation({
    mutationFn: async (data: SupportItemFormValues) => {
      // Em produção, substituir por chamada real à API
      // const response = await Api.post("/support/items", data, {
      //   headers: { "Session-Id": sessionId || "" },
      // });
      // return response.data;

      // Mock para exemplo
      const category = categories.find((c) => c.id === data.categoryId);
      if (!category) throw new Error('Categoria não encontrada');

      return {
        id: `${Date.now()}`,
        name: data.name,
        category,
        urlImage: data.urlImage || undefined,
        price: data.price,
        urlVideo: data.urlVideo || undefined,
        pdfFile: data.pdfFile || undefined,
        description: data.description || undefined,
        createdAt: new Date().toISOString(),
      };
    },
    onSuccess: (newItem) => {
      queryClient.setQueryData<SupportItem[]>(['support-items'], (old = []) => [
        ...old,
        newItem,
      ]);
      toast.success('Item criado com sucesso!');
      setIsNewItemModalOpen(false);
      itemForm.reset();
    },
    onError: () => {
      toast.error('Erro ao criar item. Tente novamente.');
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async (data: SupportItemFormValues & { id: string }) => {
      // Em produção, substituir por chamada real à API
      // const response = await Api.put(`/support/items/${data.id}`, data, {
      //   headers: { "Session-Id": sessionId || "" },
      // });
      // return response.data;

      // Mock para exemplo
      const category = categories.find((c) => c.id === data.categoryId);
      if (!category) throw new Error('Categoria não encontrada');

      return {
        ...selectedItem,
        id: data.id,
        name: data.name,
        category,
        urlImage: data.urlImage || undefined,
        price: data.price,
        urlVideo: data.urlVideo || undefined,
        pdfFile: data.pdfFile || undefined,
        description: data.description || undefined,
      };
    },
    onSuccess: (updatedItem) => {
      queryClient.setQueryData<SupportItem[]>(
        ['support-items'],
        (old = []) =>
          old?.map((item) =>
            item.id === updatedItem.id ? updatedItem : item,
          ) || [],
      );
      toast.success('Item atualizado com sucesso!');
      setIsItemModalOpen(false);
      setIsEditMode(false);
      itemForm.reset();
    },
    onError: () => {
      toast.error('Erro ao atualizar item. Tente novamente.');
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      // Em produção, substituir por chamada real à API
      // await Api.delete(`/support/items/${id}`, {
      //   headers: { "Session-Id": sessionId || "" },
      // });

      // Mock para exemplo
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<SupportItem[]>(['support-items'], (old = []) =>
        old.filter((item) => item.id !== id),
      );
      toast.success('Item excluído com sucesso!');
      setIsDeleteAlertOpen(false);
      setIsItemModalOpen(false);
      setSelectedItem(null);
    },
    onError: () => {
      toast.error('Erro ao excluir item. Tente novamente.');
    },
  });

  // Handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar busca se necessário
  };

  const handleItemClick = (item: SupportItem) => {
    setSelectedItem(item);
    setIsItemModalOpen(true);
    setIsEditMode(false);
  };

  const handleEditClick = () => {
    if (!selectedItem) return;

    itemForm.reset({
      name: selectedItem.name,
      categoryId: selectedItem.category.id,
      urlImage: selectedItem.urlImage || '',
      price: selectedItem.price,
      urlVideo: selectedItem.urlVideo || '',
      pdfFile: selectedItem.pdfFile || '',
      description: selectedItem.description || '',
    });

    setIsEditMode(true);
  };

  const handleDeleteClick = () => {
    setIsDeleteAlertOpen(true);
  };

  const handleNewItemClick = () => {
    itemForm.reset({
      name: '',
      categoryId: '',
      urlImage: '',
      price: 0,
      urlVideo: '',
      pdfFile: '',
      description: '',
    });
    setIsNewItemModalOpen(true);
  };

  const onCategorySubmit = (data: CategoryFormValues) => {
    createCategoryMutation.mutate(data);
  };

  const onItemSubmit = (data: SupportItemFormValues) => {
    if (isEditMode && selectedItem) {
      updateItemMutation.mutate({ ...data, id: selectedItem.id });
    } else {
      createItemMutation.mutate(data);
    }
  };

  // Filtrar itens por termo de busca
  const filteredItems = supportItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.name.toLowerCase().includes(searchTerm.toLowerCase()),
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
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy, HH:mm", {
        locale: ptBR,
      });
    } catch (error) {
      return dateString;
    }
  };

  // Função melhorada para verificar se a URL da imagem é válida
  const isValidImageUrl = (url?: string) => {
    return url && url.trim() !== '' && !url.includes('undefined') && !url.includes('null');
  };

  // Componente para renderizar imagem ou fallback
  const ImageWithFallback = ({ src, alt, className = "h-full w-full" }: { src?: string, alt: string, className?: string }) => {
    if (!isValidImageUrl(src)) {
      return (
        <div className="h-full w-full bg-muted flex items-center justify-center">
          <ImageIcon className="h-16 w-16 text-muted-foreground opacity-50" />
        </div>
      );
    }
    
    return (
      <div className="h-full w-full relative">
        <NextImage
          src={src!}
          alt={alt}
          fill
          style={{ objectFit: 'cover' }}
          unoptimized={true}
          onError={(e) => {
            // Substituir por ícone em caso de erro
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.parentElement!.innerHTML = `
              <div class="h-full w-full bg-muted flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-16 w-16 text-muted-foreground opacity-50">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                  <circle cx="9" cy="9" r="2"></circle>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                </svg>
              </div>
            `;
          }}
        />
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6 w-[95%]">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Suporte de Produtos</CardTitle>
              <CardDescription>
                Gerencie os produtos e informações de suporte
              </CardDescription>
            </div>
            <Button onClick={handleNewItemClick} className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Novo Item
            </Button>
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
          {isItemsLoading ? (
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
                Nenhum item encontrado. Tente uma busca diferente ou adicione um
                novo item.
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
                    <ImageWithFallback src={item.urlImage} alt={item.name} />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                      {item.name}
                    </h3>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">
                        R$ {item.price.toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {item.category.name}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {truncateText(item.description, 100)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes/Edição do Item */}
      <Dialog open={isItemModalOpen} onOpenChange={setIsItemModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          {selectedItem && !isEditMode ? (
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
                <div className="relative h-[250px] w-full rounded-md overflow-hidden">
                  <ImageWithFallback src={selectedItem.urlImage} alt={selectedItem.name} />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">
                    R$ {selectedItem.price.toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Criado em {formatDate(selectedItem.createdAt)}
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

                <div className="flex flex-wrap gap-3 pt-2">
                  {selectedItem.urlVideo && (
                    <div className="flex items-center gap-1 text-sm">
                      <Video className="h-4 w-4 text-blue-500" />
                      <a
                        href={selectedItem.urlVideo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Ver vídeo
                      </a>
                    </div>
                  )}

                  {selectedItem.pdfFile && (
                    <div className="flex items-center gap-1 text-sm">
                      <FileText className="h-4 w-4 text-red-500" />
                      <a
                        href={selectedItem.pdfFile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-500 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Ver PDF
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="flex justify-between sm:justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={handleEditClick}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteClick}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>
                  {isEditMode ? 'Editar Item' : 'Novo Item'}
                </DialogTitle>
                <DialogDescription>
                  {isEditMode
                    ? 'Edite as informações do item de suporte'
                    : 'Preencha as informações para criar um novo item de suporte'}
                </DialogDescription>
              </DialogHeader>

              <Form {...itemForm}>
                <form
                  onSubmit={itemForm.handleSubmit(onItemSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={itemForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Produto*</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do produto" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col sm:flex-row gap-4">
                    <FormField
                      control={itemForm.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Categoria*</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione uma categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.map((category) => (
                                    <SelectItem
                                      key={category.id}
                                      value={category.id}
                                    >
                                      {category.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => setIsCategoryModalOpen(true)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={itemForm.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Preço*</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={itemForm.control}
                    name="urlImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL da Imagem</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://exemplo.com/imagem.jpg"
                            {...field}
                          />
                        </FormControl>
                        <div className="mt-2 h-[120px] w-full rounded-md overflow-hidden border">
                          <ImageWithFallback src={field.value} alt="Prévia da imagem" />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col sm:flex-row gap-4">
                    <FormField
                      control={itemForm.control}
                      name="urlVideo"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>URL do Vídeo</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://exemplo.com/video.mp4"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={itemForm.control}
                      name="pdfFile"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>URL do PDF</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://exemplo.com/manual.pdf"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={itemForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva o produto..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (isEditMode) {
                          setIsEditMode(false);
                        } else {
                          setIsNewItemModalOpen(false);
                        }
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        createItemMutation.isPending ||
                        updateItemMutation.isPending
                      }
                    >
                      {isEditMode
                        ? updateItemMutation.isPending
                          ? 'Salvando...'
                          : 'Salvar Alterações'
                        : createItemMutation.isPending
                        ? 'Criando...'
                        : 'Criar Item'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para Novo Item */}
      <Dialog open={isNewItemModalOpen} onOpenChange={setIsNewItemModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Item</DialogTitle>
            <DialogDescription>
              Preencha as informações para criar um novo item de suporte
            </DialogDescription>
          </DialogHeader>

          <Form {...itemForm}>
            <form
              onSubmit={itemForm.handleSubmit(onItemSubmit)}
              className="space-y-4"
            >
              <FormField
                control={itemForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Produto*</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do produto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col sm:flex-row gap-4">
                <FormField
                  control={itemForm.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Categoria*</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.id}
                                >
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setIsCategoryModalOpen(true)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={itemForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Preço*</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={itemForm.control}
                name="urlImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL da Imagem</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://exemplo.com/imagem.jpg"
                        {...field}
                      />
                    </FormControl>
                    <div className="mt-2 h-[120px] w-full rounded-md overflow-hidden border">
                      <ImageWithFallback src={field.value} alt="Prévia da imagem" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col sm:flex-row gap-4">
                <FormField
                  control={itemForm.control}
                  name="urlVideo"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>URL do Vídeo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://exemplo.com/video.mp4"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={itemForm.control}
                  name="pdfFile"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>URL do PDF</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://exemplo.com/manual.pdf"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={itemForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva o produto..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (isEditMode) {
                      setIsEditMode(false);
                    } else {
                      setIsNewItemModalOpen(false);
                    }
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createItemMutation.isPending ||
                    updateItemMutation.isPending
                  }
                >
                  {isEditMode
                    ? updateItemMutation.isPending
                      ? 'Salvando...'
                      : 'Salvar Alterações'
                    : createItemMutation.isPending
                    ? 'Criando...'
                    : 'Criar Item'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal de Nova Categoria */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
            <DialogDescription>
              Crie uma nova categoria para os itens de suporte.
            </DialogDescription>
          </DialogHeader>

          <Form {...categoryForm}>
            <form
              onSubmit={categoryForm.handleSubmit(onCategorySubmit)}
              className="space-y-4"
            >
              <FormField
                control={categoryForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Categoria</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da categoria" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCategoryModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createCategoryMutation.isPending}
                >
                  {createCategoryMutation.isPending
                    ? 'Criando...'
                    : 'Criar Categoria'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
