import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProducts, useCrops } from '@/hooks/useProducts'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Leaf, ShieldCheck, X } from 'lucide-react'
import { PRODUCT_CATEGORY_LABELS, type ProductCategory } from '@/types/database'

export function ProductsPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<ProductCategory | ''>('')
  const [organicOnly, setOrganicOnly] = useState(false)

  const { data: products = [], isLoading } = useProducts({ search, category, organicOnly })
  const { data: crops = [] } = useCrops()

  const hasFilters = search || category || organicOnly

  const clearFilters = () => {
    setSearch('')
    setCategory('')
    setOrganicOnly(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Diretório de Produtos</h1>
        <p className="text-muted-foreground">
          Busque bioinsumos registrados no MAPA e certificados
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produto, ingrediente ativo..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={category || 'all'} onValueChange={(v: string) => setCategory(v === 'all' ? '' : v as ProductCategory)}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {Object.entries(PRODUCT_CATEGORY_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant={organicOnly ? 'default' : 'outline'}
          onClick={() => setOrganicOnly(!organicOnly)}
          className="gap-2"
        >
          <ShieldCheck className="h-4 w-4" />
          Orgânico
        </Button>
        {hasFilters && (
          <Button variant="ghost" size="icon" onClick={clearFilters}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader><div className="h-5 bg-muted rounded w-3/4" /></CardHeader>
              <CardContent><div className="h-4 bg-muted rounded w-1/2" /></CardContent>
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Leaf className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Nenhum produto encontrado</p>
            <p className="text-sm text-muted-foreground mt-1">
              {hasFilters ? 'Tente ajustar os filtros de busca' : 'Produtos serão carregados do Agrofit'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{products.length} produto(s) encontrado(s)</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Link key={product.id} to={`/products/${product.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base leading-tight">{product.name}</CardTitle>
                      {product.organic_certified && (
                        <ShieldCheck className="h-5 w-5 text-green-600 shrink-0" />
                      )}
                    </div>
                    {product.commercial_name && product.commercial_name !== product.name && (
                      <p className="text-sm text-muted-foreground">{product.commercial_name}</p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Badge variant="secondary">
                      {PRODUCT_CATEGORY_LABELS[product.category] ?? product.category}
                    </Badge>
                    {product.mapa_registration_number && (
                      <p className="text-xs text-muted-foreground">
                        MAPA: {product.mapa_registration_number}
                      </p>
                    )}
                    {product.formulation && (
                      <p className="text-xs text-muted-foreground">
                        Formulação: {product.formulation}
                      </p>
                    )}
                    {product.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
