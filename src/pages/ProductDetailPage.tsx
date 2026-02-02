import { useParams, Link } from 'react-router-dom'
import { useProduct, useProductIngredients, useProductCrops } from '@/hooks/useProducts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, ShieldCheck, FlaskConical, Sprout, FileText } from 'lucide-react'
import { PRODUCT_CATEGORY_LABELS } from '@/types/database'

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: product, isLoading } = useProduct(id)
  const { data: ingredients = [] } = useProductIngredients(id)
  const { data: crops = [] } = useProductCrops(id)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded w-1/3 animate-pulse" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-lg">Produto não encontrado</p>
        <Button asChild variant="link" className="mt-2">
          <Link to="/products">Voltar à lista</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link to="/products"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          {product.commercial_name && product.commercial_name !== product.name && (
            <p className="text-muted-foreground">{product.commercial_name}</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge>{PRODUCT_CATEGORY_LABELS[product.category] ?? product.category}</Badge>
                {product.organic_certified && (
                  <Badge variant="outline" className="text-green-700 border-green-300">
                    <ShieldCheck className="h-3 w-3 mr-1" /> Orgânico Certificado
                  </Badge>
                )}
              </div>
              {product.description && <p className="text-sm">{product.description}</p>}
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                {product.formulation && (
                  <div><span className="text-muted-foreground">Formulação:</span> {product.formulation}</div>
                )}
                {product.concentration && (
                  <div><span className="text-muted-foreground">Concentração:</span> {product.concentration}</div>
                )}
                {product.shelf_life_months && (
                  <div><span className="text-muted-foreground">Validade:</span> {product.shelf_life_months} meses</div>
                )}
                {product.mapa_registration_number && (
                  <div><span className="text-muted-foreground">Registro MAPA:</span> {product.mapa_registration_number}</div>
                )}
              </div>
            </CardContent>
          </Card>

          {product.application_instructions && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Instruções de Aplicação</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-line">{product.application_instructions}</p>
              </CardContent>
            </Card>
          )}

          {product.dosage_recommendations && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recomendações de Dosagem</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-line">{product.dosage_recommendations}</p>
              </CardContent>
            </Card>
          )}

          {product.safety_precautions && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Precauções de Segurança</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-line">{product.safety_precautions}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {ingredients.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FlaskConical className="h-4 w-4" /> Ingredientes Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {ingredients.map((pi: any) => (
                    <li key={pi.id} className="text-sm">
                      <span className="font-medium">{pi.active_ingredients?.name}</span>
                      {pi.active_ingredients?.scientific_name && (
                        <span className="text-muted-foreground italic ml-1">
                          ({pi.active_ingredients.scientific_name})
                        </span>
                      )}
                      {pi.concentration && (
                        <span className="text-muted-foreground"> — {pi.concentration}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {crops.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sprout className="h-4 w-4" /> Culturas Alvo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {crops.map((pc: any) => (
                    <Badge key={pc.id} variant="outline">{pc.crops?.name}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {product.certification_body && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Certificação</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p>{product.certification_body}</p>
                {product.certification_number && <p>Nº {product.certification_number}</p>}
                {product.certification_expiry && (
                  <p className="text-muted-foreground">Validade: {new Date(product.certification_expiry).toLocaleDateString('pt-BR')}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
