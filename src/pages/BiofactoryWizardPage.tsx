import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'
import { useCreateBiofactory, useCreateOrganization } from '@/hooks/useBiofactories'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ArrowRight, Check, Building2, MapPin, Factory, FileCheck } from 'lucide-react'
import {
  type BiofactoryType,
  BIOFACTORY_TYPE_LABELS,
  ORGANIZATION_TYPE_LABELS,
  type OrganizationType,
} from '@/types/database'

const STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA',
  'PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
]

type WizardStep = 'type' | 'organization' | 'location' | 'details' | 'review'

const STEPS: WizardStep[] = ['type', 'organization', 'location', 'details', 'review']
const STEP_LABELS: Record<WizardStep, string> = {
  type: 'Tipo',
  organization: 'Organização',
  location: 'Localização',
  details: 'Detalhes',
  review: 'Revisão',
}

interface FormData {
  biofactory_type: BiofactoryType
  // Organization
  org_name: string
  org_type: OrganizationType
  cnpj: string
  org_email: string
  org_phone: string
  // Location
  name: string
  address_street: string
  address_number: string
  address_neighborhood: string
  address_city: string
  address_state: string
  address_postal_code: string
  // Details
  production_capacity_liters: string
  infrastructure_description: string
  mapa_registration: string
  environmental_license: string
}

const INITIAL: FormData = {
  biofactory_type: 'on_farm',
  org_name: '',
  org_type: 'rural_producer',
  cnpj: '',
  org_email: '',
  org_phone: '',
  name: '',
  address_street: '',
  address_number: '',
  address_neighborhood: '',
  address_city: '',
  address_state: '',
  address_postal_code: '',
  production_capacity_liters: '',
  infrastructure_description: '',
  mapa_registration: '',
  environmental_license: '',
}

export function BiofactoryWizardPage() {
  const navigate = useNavigate()
  const { profile, refreshProfile } = useAuth()
  const createOrg = useCreateOrganization()
  const createBiofactory = useCreateBiofactory()

  const [step, setStep] = useState<WizardStep>('type')
  const [form, setForm] = useState<FormData>(INITIAL)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const stepIndex = STEPS.indexOf(step)
  const progress = ((stepIndex + 1) / STEPS.length) * 100

  const set = (field: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const next = () => {
    const i = STEPS.indexOf(step)
    if (i < STEPS.length - 1) setStep(STEPS[i + 1])
  }
  const prev = () => {
    const i = STEPS.indexOf(step)
    if (i > 0) setStep(STEPS[i - 1])
  }

  const isCommercial = form.biofactory_type === 'commercial'
  const isFamilyFarm = form.biofactory_type === 'family_farm'

  const submit = async () => {
    setSubmitting(true)
    setError('')
    try {
      let orgId = profile?.organization_id

      // Create org if user doesn't have one
      if (!orgId) {
        const org = await createOrg.mutateAsync({
          name: form.org_name,
          organization_type: form.org_type,
          cnpj: form.cnpj || null,
          email: form.org_email || null,
          phone: form.org_phone || null,
        } as any)
        orgId = org.id

        // Link profile to org
        await (supabase
          .from('user_profiles') as any)
          .update({ organization_id: orgId })
          .eq('id', profile!.id)

        await refreshProfile()
      }

      // Create biofactory
      await createBiofactory.mutateAsync({
        organization_id: orgId!,
        name: form.name || `${form.org_name} - Biofábrica`,
        biofactory_type: form.biofactory_type,
        address_city: form.address_city,
        address_state: form.address_state,
        address_street: form.address_street || undefined,
        address_number: form.address_number || undefined,
        address_neighborhood: form.address_neighborhood || undefined,
        address_postal_code: form.address_postal_code || undefined,
        production_capacity_liters: form.production_capacity_liters
          ? parseFloat(form.production_capacity_liters)
          : undefined,
        infrastructure_description: form.infrastructure_description || undefined,
        mapa_registration: form.mapa_registration || undefined,
        environmental_license: form.environmental_license || undefined,
      })

      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar biofábrica')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Registrar Biofábrica</h1>
          <p className="text-muted-foreground text-sm">
            {isFamilyFarm
              ? 'Fluxo simplificado para agricultura familiar'
              : isCommercial
                ? 'Registro comercial com CNPJ e TREPDA'
                : 'Registro on-farm (sem registro de produto)'}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          {STEPS.map((s, i) => (
            <span key={s} className={i <= stepIndex ? 'text-primary font-medium' : ''}>
              {STEP_LABELS[s]}
            </span>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>
      )}

      {/* Step: Type */}
      {step === 'type' && (
        <Card>
          <CardHeader>
            <CardTitle>Tipo de Biofábrica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(['commercial', 'on_farm', 'family_farm'] as BiofactoryType[]).map((type) => (
              <button
                key={type}
                onClick={() => set('biofactory_type', type)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                  form.biofactory_type === type
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Factory className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{BIOFACTORY_TYPE_LABELS[type]}</p>
                    <p className="text-sm text-muted-foreground">
                      {type === 'commercial' && 'Exige CNPJ, registro MAPA e dossiê técnico'}
                      {type === 'on_farm' && 'Sem registro de produto, cadastro de estabelecimento + RT'}
                      {type === 'family_farm' && 'Agricultura familiar, isenção de taxas, fluxo simplificado'}
                    </p>
                  </div>
                </div>
              </button>
            ))}
            <div className="flex justify-end">
              <Button onClick={next} className="gap-2">
                Próximo <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Organization */}
      {step === 'organization' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" /> Dados da Organização
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile?.organization_id ? (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm font-medium">Organização já vinculada ao seu perfil.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  A biofábrica será criada dentro da sua organização existente.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Nome da Organização *</Label>
                  <Input
                    value={form.org_name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('org_name', e.target.value)}
                    placeholder="Fazenda São João"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={form.org_type} onValueChange={(v: string) => set('org_type', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(ORGANIZATION_TYPE_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {isCommercial && (
                  <div className="space-y-2">
                    <Label>CNPJ *</Label>
                    <Input
                      value={form.cnpj}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('cnpj', e.target.value)}
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>E-mail</Label>
                    <Input
                      type="email"
                      value={form.org_email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('org_email', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input
                      value={form.org_phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('org_phone', e.target.value)}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
              </>
            )}
            <div className="flex justify-between">
              <Button variant="outline" onClick={prev} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Anterior
              </Button>
              <Button
                onClick={next}
                disabled={!profile?.organization_id && !form.org_name}
                className="gap-2"
              >
                Próximo <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Location */}
      {step === 'location' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" /> Localização da Biofábrica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da Biofábrica</Label>
              <Input
                value={form.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('name', e.target.value)}
                placeholder="Biofábrica Principal"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Rua</Label>
                <Input
                  value={form.address_street}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('address_street', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Número</Label>
                <Input
                  value={form.address_number}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('address_number', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Bairro</Label>
              <Input
                value={form.address_neighborhood}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('address_neighborhood', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cidade *</Label>
                <Input
                  value={form.address_city}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('address_city', e.target.value)}
                  placeholder="Ribeirão Preto"
                />
              </div>
              <div className="space-y-2">
                <Label>Estado *</Label>
                <Select value={form.address_state} onValueChange={(v: string) => set('address_state', v)}>
                  <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                  <SelectContent>
                    {STATES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>CEP</Label>
              <Input
                value={form.address_postal_code}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('address_postal_code', e.target.value)}
                placeholder="00000-000"
              />
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={prev} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Anterior
              </Button>
              <Button
                onClick={next}
                disabled={!form.address_city || !form.address_state}
                className="gap-2"
              >
                Próximo <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Details */}
      {step === 'details' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" /> Detalhes Técnicos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isFamilyFarm && (
              <div className="space-y-2">
                <Label>Capacidade de Produção (litros)</Label>
                <Input
                  type="number"
                  value={form.production_capacity_liters}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('production_capacity_liters', e.target.value)}
                  placeholder="1000"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Descrição da Infraestrutura</Label>
              <Textarea
                value={form.infrastructure_description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set('infrastructure_description', e.target.value)}
                placeholder="Descreva equipamentos, área, condições..."
                rows={3}
              />
            </div>
            {isCommercial && (
              <>
                <div className="space-y-2">
                  <Label>Registro MAPA</Label>
                  <Input
                    value={form.mapa_registration}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('mapa_registration', e.target.value)}
                    placeholder="Número do registro"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Licença Ambiental</Label>
                  <Input
                    value={form.environmental_license}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('environmental_license', e.target.value)}
                    placeholder="Número da licença"
                  />
                </div>
              </>
            )}
            {isFamilyFarm && (
              <div className="p-4 rounded-lg bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-900">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Agricultura Familiar — Fluxo Simplificado
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  Isenção de taxas conforme Lei 15.070/2024. Registro MAPA e licença ambiental não obrigatórios.
                </p>
              </div>
            )}
            <div className="flex justify-between">
              <Button variant="outline" onClick={prev} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Anterior
              </Button>
              <Button onClick={next} className="gap-2">
                Revisar <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Review */}
      {step === 'review' && (
        <Card>
          <CardHeader>
            <CardTitle>Revisão do Cadastro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo:</span>
                <Badge>{BIOFACTORY_TYPE_LABELS[form.biofactory_type]}</Badge>
              </div>
              {!profile?.organization_id && form.org_name && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Organização:</span>
                  <span>{form.org_name}</span>
                </div>
              )}
              {form.cnpj && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CNPJ:</span>
                  <span>{form.cnpj}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nome:</span>
                <span>{form.name || 'Biofábrica Principal'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Local:</span>
                <span>{form.address_city}, {form.address_state}</span>
              </div>
              {form.production_capacity_liters && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Capacidade:</span>
                  <span>{form.production_capacity_liters} L</span>
                </div>
              )}
              {form.mapa_registration && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Registro MAPA:</span>
                  <span>{form.mapa_registration}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={prev} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Editar
              </Button>
              <Button onClick={submit} disabled={submitting} className="gap-2">
                {submitting ? 'Registrando...' : (
                  <>
                    <Check className="h-4 w-4" /> Registrar Biofábrica
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
