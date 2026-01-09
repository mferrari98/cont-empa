import { useState, useEffect, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Moon, Sun, Shield, Trash2, MessageSquare, Copy, X, ArrowLeft, Send, QrCode } from "lucide-react"
import QRCode from "qrcode"

interface OrderQuantities {
  [key: string]: {
    [key: string]: number
  }
}

type CostSummary = {
  standard: { cost: number; units: number } | null
  differences: Array<{ person: string; cost: number; units: number }>
}

const people = ['Antonio', 'Hugo', 'Martín', 'Pablo', 'Javier', 'Matías', 'Redondeo']
const fixedFlavors = ['Carne', 'Carne Pic.', 'Pollo', 'Pollo Pic.', 'JyQ', 'Caprese', 'Fugazetta']
const providers = [
  { name: 'Sabor Tucumano', phone: '+5492804841540' },
  { name: 'Los de 100pre', phone: '+5492804681142' },
  { name: 'Lo de Jacinto', phone: '+5492804003172' },
  { name: 'Halloween', phone: '+5492804450909' }
]
const defaultSelections: { [key: string]: { [key: string]: number } } = {
  'Antonio': { 'Pollo': 2, 'Caprese': 1 },
  'Hugo': { 'Carne': 2, 'Pollo': 1 },
  'Martín': { 'Pollo': 3 },
  'Pablo': { 'Pollo Pic.': 3 },
  'Javier': { 'Carne': 2, 'JyQ': 1 },
  'Matías': { 'Pollo': 2, 'Carne': 1 }
}
const maxCustomColumns = 4
const MAX_QUANTITY = 100
const hourOptions = Array.from({ length: 8 }, (_, i) => (i + 7).toString().padStart(2, '0'))
const minuteOptions = ['00', '15', '30', '45']

const formatFlavorName = (flavor: string) => {
  let displayName = flavor.toLowerCase()
  if (displayName.includes('pic.')) {
    displayName = displayName.replace('pic.', 'picante')
  }
  return displayName.charAt(0).toUpperCase() + displayName.slice(1)
}

const createEmptyOrderQuantities = (): OrderQuantities => {
  const initial: OrderQuantities = {}
  people.forEach(person => {
    initial[person] = {}
  })
  return initial
}

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
  // Leer tema preferido desde localStorage (usando clave estándar portal_theme), fallback a 'dark'
  const savedTheme = localStorage.getItem('portal_theme');
  return (savedTheme === 'dark' ? 'dark' : savedTheme === 'light' ? 'light' : 'dark');
})
  const [orderQuantities, setOrderQuantities] = useState<OrderQuantities>(() => (
    createEmptyOrderQuantities()
  ))
  const [orderSummary, setOrderSummary] = useState<string>('')
  const [showSummary, setShowSummary] = useState(false)
  const [showQr, setShowQr] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [selectedProvider, setSelectedProvider] = useState('Sabor Tucumano')
  const [selectedTime, setSelectedTime] = useState('')
  const [showCostCalculator, setShowCostCalculator] = useState(false)
  const [selectedHour, selectedMinute] = useMemo(() => {
    if (!selectedTime) {
      return ['', '']
    }

    const [hour, minute] = selectedTime.split(':')
    return [hour || '', minute || '']
  }, [selectedTime])
  const [totalCost, setTotalCost] = useState('')
  const [costPerPerson, setCostPerPerson] = useState<{[key: string]: number}>({})
  const [standardQuantity, setStandardQuantity] = useState(0)

  // Columnas personalizadas dinámicas
  const [customColumns, setCustomColumns] = useState<string[]>([])

  // Combinar sabores fijos con personalizados dentro del componente
  const allFlavors = useMemo(() => [...fixedFlavors, ...customColumns], [customColumns])
  const whatsappUrl = useMemo(() => {
    const trimmedSummary = orderSummary.trim()
    if (!trimmedSummary) {
      return ''
    }

    const provider = providers.find(p => p.name === selectedProvider)
    if (!provider) {
      return ''
    }

    const encodedMessage = encodeURIComponent(trimmedSummary)
    return `https://wa.me/${provider.phone.replace(/\D/g, '')}?text=${encodedMessage}`
  }, [orderSummary, selectedProvider])

  // Apply dark mode class to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  // Escuchar cambios de tema desde otras pestañas/aplicaciones
  useEffect(() => {
    const handleThemeEvent = (e: any) => {
      if (e.detail?.theme && ['light', 'dark'].includes(e.detail.theme)) {
        setTheme(e.detail.theme)
      }
    }

    // Escuchar evento personalizado
    window.addEventListener('themeChanged', handleThemeEvent)

    // También escuchar cambios en storage (de otras pestañas/aplicaciones)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'portal_theme' && e.newValue) {
        setTheme(e.newValue as 'light' | 'dark')
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('themeChanged', handleThemeEvent)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  useEffect(() => {
    if (!showSummary || !orderSummary.trim()) {
      setShowQr(false)
    }
  }, [showSummary, orderSummary])

  useEffect(() => {
    let active = true

    if (!showQr || !whatsappUrl) {
      setQrDataUrl('')
      return () => {
        active = false
      }
    }

    QRCode.toDataURL(whatsappUrl, {
      width: 240,
      margin: 1
    })
      .then((url) => {
        if (active) {
          setQrDataUrl(url)
        }
      })
      .catch((err) => {
        console.error('Error al generar QR:', err)
        if (active) {
          setQrDataUrl('')
        }
      })

    return () => {
      active = false
    }
  }, [showQr, whatsappUrl])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    // Guardar en localStorage con clave estándar para persistencia y sincronización entre apps
    localStorage.setItem('portal_theme', newTheme)
    // Disparar evento para sincronizar otras pestañas/aplicaciones
    window.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { theme: newTheme }
    }))
  }

  const sendWhatsAppMessage = () => {
    if (!whatsappUrl) {
      return false
    }

    const popup = window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
    if (popup) {
      popup.opener = null
      return true
    }

    return false
  }

  const copyToClipboard = async (text: string) => {
    try {
      const normalizedText = text.trim()
      if (!normalizedText) {
        return false
      }

      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(normalizedText)
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea')
        textArea.value = normalizedText
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
      return true
    } catch (err) {
      console.error('Failed to copy text: ', err)
      return false
    }
  }

  const scrollToElement = (elementId: string) => {
    // Mayor delay para asegurar renderizado completo
    setTimeout(() => {
      const element = document.getElementById(elementId);
      if (element) {
        const prevDocScroll = document.documentElement.style.scrollBehavior;
        const prevBodyScroll = document.body.style.scrollBehavior;

        // Aplicar transición CSS adicional para mayor suavidad
        document.documentElement.style.scrollBehavior = 'smooth';
        document.body.style.scrollBehavior = 'smooth';

        // Scroll ultra suave con opciones personalizadas
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });

        setTimeout(() => {
          document.documentElement.style.scrollBehavior = prevDocScroll;
          document.body.style.scrollBehavior = prevBodyScroll;
        }, 500);
      }
    }, 300);
  }

  const showCostCalculatorWithScroll = () => {
    setShowCostCalculator(true);
    scrollToElement('cost-calculator-card');
  }

  const resetCostCalculatorState = () => {
    setShowCostCalculator(false)
    setTotalCost('')
    setCostPerPerson({})
    setStandardQuantity(0)
  }

  const resetDerivedState = () => {
    setShowSummary(false)
    resetCostCalculatorState()
  }

  // Función para agregar una columna personalizada
  const addCustomColumn = () => {
    setCustomColumns(prev => {
      if (prev.length >= maxCustomColumns) {
        return prev
      }

      return [...prev, `Gusto ${prev.length + 1}`]
    })
  }

  // Función para actualizar el nombre de una columna personalizada
  const updateCustomColumnName = (index: number, newName: string) => {
    const trimmedName = newName.trim()
    const fallbackName = `Gusto ${index + 1}`
    const oldName = customColumns[index]
    const nextName = trimmedName || fallbackName

    setCustomColumns(prev => {
      const updatedColumns = [...prev]
      updatedColumns[index] = nextName
      return updatedColumns
    })

    if (!oldName || oldName === nextName) {
      return
    }

    setOrderQuantities(prev => {
      const updated: OrderQuantities = {}
      people.forEach(person => {
        const personOrders = { ...prev[person] }
        if (Object.prototype.hasOwnProperty.call(personOrders, oldName)) {
          const oldValue = personOrders[oldName] || 0
          const nextValue = personOrders[nextName] || 0
          personOrders[nextName] = oldValue + nextValue
          delete personOrders[oldName]
        }
        updated[person] = personOrders
      })
      return updated
    })

    resetDerivedState()
  }

  // Función para limpiar todas las columnas personalizadas
  const handleQuantityChange = (person: string, flavor: string, value: string) => {
    const quantity = parseInt(value, 10) || 0
    if (quantity >= 0) {
      setOrderQuantities(prev => ({
        ...prev,
        [person]: {
          ...prev[person],
          [flavor]: quantity
        }
      }))
      // Cerrar ventanas al modificar cantidades
      resetDerivedState()
    }
  }

  const handlePersonClick = (person: string) => {
    if (defaultSelections[person]) {
      setOrderQuantities(prev => ({
        ...prev,
        [person]: {
          ...prev[person],
          ...defaultSelections[person]
        }
      }))
      resetDerivedState()
    }
  }

  const handleClearAll = () => {
    setOrderQuantities(createEmptyOrderQuantities())
    resetDerivedState()
  }

  const hasAnySelections = useMemo(() => (
    people.some(person =>
      Object.values(orderQuantities[person] || {}).some(quantity => quantity > 0)
    )
  ), [orderQuantities])

  const getFlavorTotals = (flavors: string[]) => {
    const totals: { [key: string]: number } = {}
    flavors.forEach(flavor => {
      totals[flavor] = people.reduce((sum, person) => (
        sum + (orderQuantities[person][flavor] || 0)
      ), 0)
    })
    return totals
  }

  const getPersonTotals = () => {
    const totals: { [key: string]: number } = {}
    people.forEach(person => {
      const total = allFlavors.reduce((sum, flavor) => (
        sum + (orderQuantities[person][flavor] || 0)
      ), 0)

      if (total > 0) {
        totals[person] = total
      }
    })
    return totals
  }

  const buildOrderSummary = (time: string) => {
    const flavorTotals = getFlavorTotals(allFlavors)

    // Generate simple order text
    const orderItems: string[] = []
    let totalEmpanadas = 0

    Object.entries(flavorTotals).forEach(([flavor, count]) => {
      if (count > 0) {
        totalEmpanadas += count
        orderItems.push(`${count} ${formatFlavorName(flavor)}`)
      }
    })

    if (totalEmpanadas === 0) {
      return ''
    }

    let orderText = `Buenos dias, quiero hacer un pedido de ${totalEmpanadas} empanadas y serian: ${orderItems.join(', ')}`
    if (time) {
      orderText += ` para las ${time}hs`
    }

    return orderText
  }

  const shouldUpdateSummary = showSummary && hasAnySelections && orderSummary.trim().length > 0

  const generateOrder = () => {
    // Check if there are any selections
    if (!hasAnySelections) {
      return // Don't show summary if nothing is selected
    }

    const orderText = buildOrderSummary(selectedTime)
    if (!orderText) {
      setShowSummary(false)
      setOrderSummary('')
      return
    }

    setOrderSummary(orderText)
    setShowSummary(true)

    // Scroll to summary after showing it
    scrollToElement('order-summary-card');
  }

  const generateOrderWithTime = (time: string) => {
    // Check if there are any selections
    if (!hasAnySelections) {
      return // Don't show summary if nothing is selected
    }

    const summary = buildOrderSummary(time)
    if (!summary) {
      setShowSummary(false)
      setOrderSummary('')
      return
    }

    setOrderSummary(summary)
  }

  const updateSelectedTime = (nextTime: string) => {
    setSelectedTime(nextTime)
    if (shouldUpdateSummary) {
      generateOrderWithTime(nextTime)
    }
  }

  const calculateCostPerPerson = () => {
    const cost = parseFloat(totalCost)
    if (isNaN(cost) || cost <= 0) {
      setCostPerPerson({})
      setStandardQuantity(0)
      return
    }

    const personTotals = getPersonTotals()
    const totals = Object.values(personTotals)

    if (totals.length === 0) {
      setCostPerPerson({})
      setStandardQuantity(0)
      return
    }

    const quantityCount: { [key: string]: number } = {}
    let mostCommonQuantity = 0
    let mostCommonCount = 0

    totals.forEach(personTotal => {
      const newCount = (quantityCount[personTotal] || 0) + 1
      quantityCount[personTotal] = newCount

      if (newCount > mostCommonCount) {
        mostCommonCount = newCount
        mostCommonQuantity = personTotal
      }
    })

    // Calculate cost per empanada
    const totalEmpanadas = totals.reduce((sum, count) => sum + count, 0)

    if (totalEmpanadas === 0) {
      setCostPerPerson({})
      setStandardQuantity(0)
      return
    }

    const costPerEmpanada = cost / totalEmpanadas

    // Calculate individual costs
    const individualCosts: { [key: string]: number } = {}
    Object.entries(personTotals).forEach(([person, quantity]) => {
      individualCosts[person] = Math.round(costPerEmpanada * quantity)
    })

    setStandardQuantity(mostCommonQuantity)
    setCostPerPerson(individualCosts)
  }

  const hasCostResults = Object.keys(costPerPerson).length > 0

  const costSummary: CostSummary = useMemo(() => {
    if (!hasCostResults) {
      return { standard: null, differences: [] }
    }

    let standard: CostSummary['standard'] = null
    const differences: CostSummary['differences'] = []

    Object.entries(costPerPerson).forEach(([person, cost]) => {
      const personTotal = Object.values(orderQuantities[person] || {}).reduce((sum, qty) => sum + qty, 0)

      if (personTotal === standardQuantity && !standard) {
        standard = { cost, units: standardQuantity }
      } else {
        differences.push({ person, cost, units: personTotal })
      }
    })

    return { standard, differences }
  }, [hasCostResults, costPerPerson, orderQuantities, standardQuantity])

  const themeClasses = useMemo(() => ({
    bg: theme === 'dark' ? 'bg-[#141413]' : 'bg-[#FAF9F5]',
    bgCard: theme === 'dark' ? 'bg-[#1F1E1D]' : 'bg-[#E8E8E8]',
    text: theme === 'dark' ? 'text-[#E5E4E0]' : 'text-[#141413]',
    textMuted: theme === 'dark' ? 'text-[#E5E4E0]/70' : 'text-[#141413]/70',
    textSubtle: theme === 'dark' ? 'text-[#6ccff6]' : 'text-[#6ccff6]',
    textFaded: theme === 'dark' ? 'text-[#E5E4E0]/50' : 'text-[#141413]/50',
    border: theme === 'dark' ? 'border-[#1F1E1D]' : 'border-[#F5F4F0]',
    borderLight: theme === 'dark' ? 'border-[#1F1E1D]' : 'border-[#F5F4F0]',
    borderHover: '',
    bgHover: theme === 'dark' ? 'hover:bg-[#1F1E1D]' : 'hover:bg-[#F5F4F0]',
    iconBg: theme === 'dark' ? 'bg-[#141413]' : 'bg-white',
    inputBg: theme === 'dark' ? 'bg-[#1F1E1D]' : 'bg-[#E8E8E8]',
    accent: 'bg-[#6ccff6]',
    cellBg: theme === 'dark' ? 'bg-[#2A2A28]' : 'bg-[#F8F8F8]',
    cellHover: theme === 'dark' ? 'hover:bg-[#333330]' : 'hover:bg-[#EFEFEF]',
    headerBg: theme === 'dark' ? 'bg-[#333330]' : 'bg-[#F0F0F0]',
    tableBorder: theme === 'dark' ? 'border-[#40403C]' : 'border-[#D0D0D0]',
    tableBorderLight: theme === 'dark' ? 'border-white/30' : 'border-black/12',
  }), [theme])

  return (
    <div className={`min-h-screen gradient-background relative`}>

        {/* Top Bar - Portal Servicios Style */}
        <div className={`border-b ${themeClasses.borderLight} relative z-10`}>
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a
                href="/"
                className={`w-8 h-8 rounded-md border flex items-center justify-center ${themeClasses.bgCard} ${themeClasses.border} hover:opacity-80 transition-opacity cursor-pointer`}
              >
                <Shield className={`w-4 h-4 ${themeClasses.text}`} />
              </a>
              <a
                href="/"
                className={`text-base font-medium ${themeClasses.text} cursor-pointer transition-opacity hover:opacity-80`}
              >
                Telecomunicaciones y Automatismos
              </a>
            </div>

            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <Button
                onClick={toggleTheme}
                variant="outline"
                size="icon"
                className={`border-2 ${themeClasses.border} ${themeClasses.text} rounded-md h-8 w-8 cursor-pointer`}
              >
                {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </Button>

              </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="py-6 px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Header - aligned with table */}
            <div className="mb-6 mt-8 mx-auto max-w-5xl">
              <h1 className={`text-5xl font-bold tracking-tight ${themeClasses.text} inline-block whitespace-nowrap`}>
                Pedidos
              </h1>
              <p className={`text-base mt-2 ${themeClasses.textSubtle}`}>
                Sistema de gestión
              </p>
            </div>

          {/* Excel-style Table with White Interior Lines - No Header Text */}
          <div className="relative max-w-5xl mx-auto">
            <Card className={`${themeClasses.bgCard} max-w-5xl mx-auto rounded-lg overflow-hidden shadow-lg`}>
              <CardContent className="px-4 py-2">
                <div className="overflow-x-auto">
                  <table className="w-full border-separate border-spacing-0 min-w-[800px]">
                    <thead>
                      <tr className={`${themeClasses.bgCard}`}>
                        <th className={`w-24 font-bold text-left border-b ${themeClasses.tableBorderLight} ${themeClasses.text} text-sm px-3 py-3`}>

                        </th>
                        {allFlavors.map((flavor, index) => (
                          <th
                            key={flavor}
                            className={`font-bold text-center border-b border-l ${themeClasses.tableBorderLight} ${themeClasses.text} text-sm px-2 py-3 min-w-[80px]`}
                          >
                            {index >= fixedFlavors.length ? (
                              <input
                                key={`custom-input-${index}`}
                                type="text"
                                id={`custom-flavor-${index}`}
                                name={`custom-flavor-${index}`}
                                aria-label={`Nombre del gusto personalizado ${index - fixedFlavors.length + 1}`}
                                defaultValue={flavor}
                                onBlur={(e) => updateCustomColumnName(index - fixedFlavors.length, e.target.value)}
                                className={`bg-transparent border-none text-center ${themeClasses.text} text-sm font-bold w-full outline-none focus:${themeClasses.cellBg} focus:ring-1 focus:ring-[#6ccff6] rounded`}
                                placeholder={`Gusto ${index - fixedFlavors.length + 1}`}
                              />
                            ) : (
                              flavor
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {people.map((person, personIndex) => (
                        <tr
                          key={person}
                          className={`${themeClasses.bgCard}`}
                        >
                          <td
                            className={`font-medium ${personIndex === people.length - 1 ? '' : `border-b ${themeClasses.tableBorderLight}`} ${themeClasses.text} sticky left-0 ${themeClasses.bgCard} z-10 text-sm px-3 py-2 cursor-pointer hover:opacity-80`}
                            onClick={() => handlePersonClick(person)}
                          >
                            {person}
                          </td>
                          {allFlavors.map((flavor) => (
                            <td
                              key={`${person}-${flavor}`}
                              className={`${personIndex === people.length - 1 ? '' : 'border-b'} border-l ${themeClasses.tableBorderLight} p-2 text-center min-w-[80px] align-middle`}
                            >
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                id={`quantity-${person}-${flavor}`}
                                name={`quantity-${person}-${flavor}`}
                                aria-label={`Cantidad de ${flavor} para ${person}`}
                                min="0"
                                max={MAX_QUANTITY}
                                maxLength={String(MAX_QUANTITY).length}
                                value={orderQuantities[person][flavor] || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  // Solo permitir números
                                  if (value === '' || /^[0-9]*$/.test(value)) {
                                    const numValue = parseInt(value, 10) || 0;
                                    // Limitar a máximo configurado
                                    if (numValue <= MAX_QUANTITY) {
                                      handleQuantityChange(person, flavor, value);
                                    }
                                  }
                                }}
                                className={`w-full h-8 text-center font-mono text-base ${themeClasses.inputBg} ${themeClasses.text} border-0 focus:outline-none focus:ring-1 focus:ring-[#6ccff6] transition-colors [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none`}
                                placeholder=""
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            
            {/* Action Buttons */}
            <div className="mt-3 max-w-5xl mx-auto flex justify-end gap-3">
              {(hasAnySelections || customColumns.length > 0) && (
                <button
                  type="button"
                  onClick={() => {
                    if (customColumns.length > 0) {
                      setCustomColumns([])
                    }
                    handleClearAll()
                  }}
                  className={`h-7 px-3 rounded cursor-pointer transition-colors flex items-center justify-center font-semibold ${
                    theme === 'dark'
                      ? 'text-white hover:bg-white/10'
                      : 'text-black hover:bg-black/10'
                  }`}
                  title={customColumns.length > 0 ? "Limpiar contenido y columnas personalizadas" : "Limpiar contenido"}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <Button
                onClick={addCustomColumn}
                disabled={customColumns.length >= maxCustomColumns}
                className="bg-green-500/54 text-white hover:bg-green-500/60 font-semibold py-3 px-3 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                title={customColumns.length >= maxCustomColumns ? "Máximo 4 gustos personalizados" : "Agregar gusto personalizado"}
              >
                Agregar gustos
              </Button>
              <Button
                onClick={generateOrder}
                disabled={!hasAnySelections}
                className="bg-[#6ccff6]/60 text-white hover:bg-[#6ccff6]/70 disabled:bg-gray-500/50 disabled:text-gray-400 disabled:cursor-not-allowed font-semibold py-3 min-w-[80px] cursor-pointer shadow-md"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Generar Pedido
              </Button>
            </div>

            {/* Simple Order Summary */}
            {showSummary && (
              <Card id="order-summary-card" className={`${themeClasses.bgCard} max-w-5xl mx-auto mt-4 shadow-2xl rounded-lg overflow-hidden`}>
                <CardContent className="p-6">
                  {/* Header Section */}
                  <div className="flex items-center mb-6 pb-4 border-b border-white/20">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full bg-[#6ccff6]/20 flex items-center justify-center`}>
                        <MessageSquare className={`w-4 h-4 text-[#6ccff6]`} />
                      </div>
                      <div>
                        <h2 className={`text-xl font-bold ${themeClasses.text}`}>Resumen del Pedido</h2>
                        <p className={`text-sm ${themeClasses.textMuted}`}>Confirma y envía tu pedido</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setShowSummary(false)}
                      variant="outline"
                      size="icon"
                      className={`cursor-pointer shadow-md ${themeClasses.border} ${themeClasses.text} ml-auto`}
                      aria-label="Cerrar resumen"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Provider and Time Selectors */}
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <label htmlFor="provider-select" className={`text-sm ${themeClasses.text} font-bold text-left`}>Seleccionar Proveedor:</label>
                      <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                        <SelectTrigger
                          id="provider-select"
                          name="provider-select"
                          className={`w-[200px] ${themeClasses.cellBg} ${themeClasses.text} cursor-pointer border-transparent focus:ring-2 focus:ring-[#6ccff6] transition-all duration-200`}
                        >
                          <SelectValue placeholder="Seleccionar proveedor" className="text-sm" />
                        </SelectTrigger>
                        <SelectContent className={`${themeClasses.bgCard} ${themeClasses.text} border ${themeClasses.border} shadow-lg`}>
                          {providers.map(provider => (
                            <SelectItem
                              key={provider.name}
                              value={provider.name}
                              className={`text-sm ${themeClasses.text} cursor-pointer hover:${themeClasses.bgHover} transition-colors`}
                            >
                              {provider.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-3">
                      <label htmlFor="time-hour-select" className={`text-sm ${themeClasses.text} font-bold text-left`}>Horario del pedido:</label>
                      <div className="flex items-center gap-2">
                        {/* Selector de hora */}
                        <select
                          id="time-hour-select"
                          name="time-hour-select"
                          value={selectedHour}
                          onChange={(e) => {
                            const hour = e.target.value;
                            if (!hour) {
                              updateSelectedTime('')
                              return;
                            }

                            const minute = selectedMinute || '00';
                            const newTime = `${hour.padStart(2, '0')}:${minute}`;
                            updateSelectedTime(newTime)
                          }}
                          className={`w-[70px] px-2 py-2 rounded ${themeClasses.cellBg} ${themeClasses.text} border-transparent focus:ring-2 focus:ring-[#6ccff6] transition-all duration-200 cursor-pointer text-center`}
                          aria-label="Seleccionar hora"
                        >
                          <option value="">hh</option>
                          {hourOptions.map(hour => (
                            <option key={hour} value={hour}>
                              {hour}
                            </option>
                          ))}
                        </select>

                        <span className={`${themeClasses.text} font-bold text-lg mx-1`}>:</span>

                        {/* Selector de minutos */}
                        <select
                          id="time-minute-select"
                          name="time-minute-select"
                          value={selectedMinute}
                          onChange={(e) => {
                            const minute = e.target.value;
                            if (!minute) {
                              updateSelectedTime('')
                              return;
                            }

                            if (!selectedHour) {
                              updateSelectedTime('')
                              return;
                            }

                            const newTime = `${selectedHour}:${minute}`;
                            updateSelectedTime(newTime)
                          }}
                          className={`w-[70px] px-2 py-2 rounded ${themeClasses.cellBg} ${themeClasses.text} border-transparent focus:ring-2 focus:ring-[#6ccff6] transition-all duration-200 cursor-pointer text-center`}
                          aria-label="Seleccionar minutos"
                        >
                          <option value="">mm</option>
                          {minuteOptions.map(minute => (
                            <option key={minute} value={minute}>
                              {minute}
                            </option>
                          ))}
                        </select>

                        {selectedTime && (
                          <Button
                            onClick={() => {
                              updateSelectedTime('')
                            }}
                            variant="outline"
                            size="icon"
                            className={`h-8 w-8 cursor-pointer shadow-md ${themeClasses.border} ${themeClasses.text}`}
                            title="Limpiar hora"
                            aria-label="Limpiar hora seleccionada"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Content */}
                  <div className="mb-6">
                    <div className={`p-4 rounded-lg ${themeClasses.cellBg} shadow-inner`}>
                      <p className={`${themeClasses.text} font-mono leading-relaxed text-sm`}>
                        {orderSummary}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-white/20">
                    <Button
                      onClick={async () => {
                        const success = await copyToClipboard(orderSummary);
                        if (success) {
                          showCostCalculatorWithScroll();
                        }
                      }}
                      size="icon"
                      className="bg-[#6ccff6]/60 text-white hover:bg-[#6ccff6]/70 cursor-pointer shadow-md"
                      aria-label="Copiar pedido"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => {
                        if (!whatsappUrl) {
                          return
                        }

                        if (!showQr) {
                          setShowQr(true)
                          setShowCostCalculator(true)
                          scrollToElement('whatsapp-qr-card')
                          return
                        }

                        setShowQr(false)
                      }}
                      size="icon"
                      className="bg-amber-500/54 text-white hover:bg-amber-500/60 cursor-pointer shadow-md"
                      aria-label={showQr ? "Ocultar QR de WhatsApp" : "Generar QR de WhatsApp"}
                    >
                      <QrCode className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => {
                        const sent = sendWhatsAppMessage();
                        if (sent) {
                          showCostCalculatorWithScroll();
                        }
                      }}
                      size="icon"
                      className="bg-green-500/54 text-white hover:bg-green-500/60 cursor-pointer shadow-md"
                      aria-label="Enviar pedido por WhatsApp"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* QR Window */}
            {showQr && whatsappUrl && (
              <Card id="whatsapp-qr-card" className={`${themeClasses.bgCard} max-w-5xl mx-auto mt-4 shadow-2xl rounded-lg overflow-hidden`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/20">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center`}>
                        <QrCode className={`w-4 h-4 text-amber-500`} />
                      </div>
                      <div>
                        <h2 className={`text-xl font-bold ${themeClasses.text}`}>QR de WhatsApp</h2>
                        <p className={`text-sm ${themeClasses.textMuted}`}>
                          Escaneá este código para abrir el chat con el mensaje del pedido listo para enviar.
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setShowQr(false)}
                      variant="outline"
                      size="icon"
                      className={`cursor-pointer shadow-md ${themeClasses.border} ${themeClasses.text}`}
                      aria-label="Cerrar QR de WhatsApp"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className={`p-4 rounded-lg ${themeClasses.cellBg} shadow-inner`}>
                      {qrDataUrl ? (
                        <img
                          src={qrDataUrl}
                          alt="QR de WhatsApp para el pedido"
                          className="w-52 h-52"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-52 h-52 flex items-center justify-center">
                          <span className={`text-xs ${themeClasses.textMuted}`}>Generando QR...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cost Calculator */}
            {showCostCalculator && (
              <Card id="cost-calculator-card" className={`${themeClasses.bgCard} max-w-5xl mx-auto mt-4 shadow-2xl rounded-lg overflow-hidden`}>
                <CardContent className="p-6">
                  {/* Header Section */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/20">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center`}>
                        <span className="text-green-500 font-bold text-lg">$</span>
                      </div>
                      <div>
                        <h2 className={`text-xl font-bold ${themeClasses.text}`}>Calcular Costos</h2>
                        <p className={`text-sm ${themeClasses.textMuted}`}>Repartir el costo del pedido</p>
                      </div>
                    </div>
                    <Button
                      onClick={resetCostCalculatorState}
                      variant="outline"
                      size="icon"
                      className={`cursor-pointer shadow-md ${themeClasses.border} ${themeClasses.text}`}
                      aria-label="Cerrar calculadora de costos"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Cost Calculator Layout */}
                  <div className="flex gap-6 mb-6">
                    {/* Cost Results - Left Side */}
                    {hasCostResults && (
                      <div className="flex-1">
                        <div className={`p-4 rounded-lg ${themeClasses.cellBg} shadow-inner h-full`}>
                          <div className={`space-y-2 ${themeClasses.text} font-mono leading-relaxed text-sm`}>
                            {costSummary.standard && (
                              <div className="font-bold">
                                Costo por persona ({costSummary.standard.units} unidades): ${costSummary.standard.cost}
                              </div>
                            )}
                            {costSummary.differences.map(({ person, cost, units }) => (
                              <div key={person} className="ml-4">
                                {person} ({units} unidades): ${cost}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Cost Input - Right Side */}
                    <div className={`${hasCostResults ? 'w-80' : 'w-full'}`}>
                      <label htmlFor="total-cost-input" className={`text-sm ${themeClasses.text} font-bold text-left block mb-3`}>Valor Total del Pedido:</label>
                      <div className="space-y-3">
                        <div className="relative">
                          <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${themeClasses.textMuted} font-bold`}>$</span>
                          <input
                            type="number"
                            id="total-cost-input"
                            name="total-cost-input"
                            value={totalCost}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              if (value <= 1000000 || e.target.value === '') {
                                setTotalCost(e.target.value);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                calculateCostPerPerson();
                              }
                            }}
                            placeholder="0.00"
                            className={`w-full pl-8 pr-3 py-2 rounded ${themeClasses.cellBg} ${themeClasses.text} border-transparent focus:ring-2 focus:ring-green-500 transition-all duration-200 [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none`}
                            min="0"
                            max="1000000"
                            step="0.01"
                          />
                        </div>
                        <Button
                          onClick={calculateCostPerPerson}
                          disabled={!totalCost || parseFloat(totalCost) <= 0}
                          className="w-full bg-green-500/54 text-white hover:bg-green-500/60 font-semibold py-2 px-4 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Calcular costo
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Back to Portal Button - Same container as other buttons */}
            <div className="mt-6 max-w-5xl mx-auto flex justify-start">
              <Button
                onClick={() => {
                  // El tema ya está guardado en portal_theme, solo redirigir
                  window.location.href = '/'
                }}
                className={`${themeClasses.bgCard} ${themeClasses.text} border-2 ${themeClasses.border} hover:opacity-80 font-semibold py-3 px-3 cursor-pointer shadow-md`}
                aria-label="Volver al Portal"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Portal
              </Button>
            </div>
          </div>
        </div>

        {/* Espacio permanente para scroll y centrado de ventanas */}
        <div className="h-96" /> {/* 96 (24rem) = 384px de espacio extra permanente */}
      </div>
    </div>
  )
}

export default App
