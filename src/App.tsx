import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Moon, Sun, Shield, Trash2, MessageSquare, Copy, X, ArrowLeft, Send } from "lucide-react"

interface OrderQuantities {
  [key: string]: {
    [key: string]: number
  }
}

const people = ['Antonio', 'Hugo', 'Martín', 'Pablo', 'Javier', 'Matías', 'Redondeo']
const fixedFlavors = ['Carne', 'Carne Pic.', 'Pollo', 'Pollo Pic.', 'JyQ', 'Caprese', 'Fugazetta']

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
  // Leer tema preferido desde localStorage, fallback a 'dark'
  const savedTheme = localStorage.getItem('app-theme');
  return (savedTheme === 'dark' ? 'dark' : savedTheme === 'light' ? 'light' : 'dark');
})
  const [orderQuantities, setOrderQuantities] = useState<OrderQuantities>(() => {
    const initial: OrderQuantities = {}
    people.forEach(person => {
      initial[person] = {}
    })
    return initial
  })
  const [orderSummary, setOrderSummary] = useState<string>('')
  const [showSummary, setShowSummary] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState('Sabor Tucumano')

  const providers = [
    { name: 'Sabor Tucumano', phone: '+5492804841540' },
    { name: 'Los de 100pre', phone: '+5492804681142' },
    { name: 'Lo de Jacinto', phone: '+5492804003172' },
    { name: 'Halloween', phone: '+5492804450909' }
  ]

  // Columnas personalizadas dinámicas
  const [customColumns, setCustomColumns] = useState<string[]>([])
  const maxCustomColumns = 6

  // Combinar sabores fijos con personalizados dentro del componente
  const allFlavors = [...fixedFlavors, ...customColumns]

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

    // También escuchar cambios en storage (de otras pestañas)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'app-theme' && e.newValue) {
        setTheme(e.newValue as 'light' | 'dark')
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('themeChanged', handleThemeEvent)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    // Guardar en localStorage para persistencia
    localStorage.setItem('app-theme', newTheme)
    // Disparar evento para sincronizar otras pestañas
    window.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { theme: newTheme }
    }))
  }

  const sendWhatsAppMessage = () => {
    const provider = providers.find(p => p.name === selectedProvider)
    if (provider) {
      const encodedMessage = encodeURIComponent(orderSummary)
      const whatsappUrl = `https://wa.me/${provider.phone.replace(/\D/g, '')}?text=${encodedMessage}`
      window.open(whatsappUrl, '_blank')
    }
  }

  // Función para agregar una columna personalizada
  const addCustomColumn = () => {
    if (customColumns.length < maxCustomColumns) {
      const newColumnName = `Gusto ${customColumns.length + 1}`
      setCustomColumns([...customColumns, newColumnName])
    }
  }

  // Función para actualizar el nombre de una columna personalizada
  const updateCustomColumnName = (index: number, newName: string) => {
    const updatedColumns = [...customColumns]
    updatedColumns[index] = newName || `Gusto ${index + 1}`
    setCustomColumns(updatedColumns)
  }

  // Función para limpiar todas las columnas personalizadas
  const clearCustomColumns = () => {
    setCustomColumns([])
    // También limpiar los datos de esas columnas en el estado
    const clearedOrder: OrderQuantities = {}
    people.forEach(person => {
      clearedOrder[person] = {}
      // Mantener solo los datos de los sabores fijos
      fixedFlavors.forEach(flavor => {
        clearedOrder[person][flavor] = orderQuantities[person][flavor] || 0
      })
    })
    setOrderQuantities(clearedOrder)
  }

  const handleQuantityChange = (person: string, flavor: string, value: string) => {
    const quantity = parseInt(value) || 0
    if (quantity >= 0) {
      setOrderQuantities(prev => ({
        ...prev,
        [person]: {
          ...prev[person],
          [flavor]: quantity
        }
      }))
    }
  }

  const handlePersonClick = (person: string) => {
    const defaultSelections: { [key: string]: { [key: string]: number } } = {
      'Antonio': { 'Pollo': 2, 'Caprese': 1 },
      'Hugo': { 'Carne': 2, 'Pollo': 1 },
      'Martín': { 'Pollo': 3 },
      'Pablo': { 'Pollo Pic.': 3 },
      'Matías': { 'Pollo': 2, 'Carne': 1 }
    }

    if (defaultSelections[person]) {
      setOrderQuantities(prev => ({
        ...prev,
        [person]: {
          ...prev[person],
          ...defaultSelections[person]
        }
      }))
    }
  }

  const handleClearAll = () => {
    const clearedOrder: OrderQuantities = {}
    people.forEach(person => {
      clearedOrder[person] = {}
    })
    setOrderQuantities(clearedOrder)
  }

  const hasSelections = () => {
    return people.some(person =>
      Object.values(orderQuantities[person] || {}).some(quantity => quantity > 0)
    )
  }

  const generateOrder = () => {
    // Check if there are any selections
    if (!hasSelections()) {
      return // Don't show summary if nothing is selected
    }

    const flavorTotals: { [key: string]: number } = {}

    // Calculate totals for each flavor (fixed + custom)
    allFlavors.forEach(flavor => {
      let total = 0
      people.forEach(person => {
        total += orderQuantities[person][flavor] || 0
      })
      flavorTotals[flavor] = total
    })

    // Generate simple order text
    const orderItems: string[] = []
    let totalEmpanadas = 0
    allFlavors.forEach(flavor => {
      const count = flavorTotals[flavor]
      if (count > 0) {
        totalEmpanadas += count
        // Replace 'Pic.' with 'picante' for display
        let displayName = flavor.toLowerCase()
        if (displayName.includes('pic.')) {
          displayName = displayName.replace('pic.', 'picante')
        }
        // Capitalize first letter
        displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1)
        orderItems.push(`${count} ${displayName}`)
      }
    })

    const orderText = `Buenos dias, quiero hacer un pedido de ${totalEmpanadas} empanadas y serian: ${orderItems.join(', ')}`
    setOrderSummary(orderText)
    setShowSummary(true)
  }

  const themeClasses = {
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
  }

  return (
    <div className={`min-h-screen gradient-background relative`}>

        {/* Top Bar - Portal Servicios Style */}
        <div className={`border-b ${themeClasses.borderLight} relative z-10`}>
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a
                href="http://10.10.9.252"
                className={`w-8 h-8 rounded-md border flex items-center justify-center ${themeClasses.bgCard} ${themeClasses.border} hover:opacity-80 transition-opacity cursor-pointer`}
              >
                <Shield className={`w-4 h-4 ${themeClasses.text}`} />
              </a>
              <a
                href="http://10.10.9.252"
                className={`text-base font-medium ${themeClasses.text} cursor-pointer`}
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
                Emp
              </h1>
              <p className={`text-base mt-2 ${themeClasses.textSubtle}`}>
                Sistema de gestión
              </p>
            </div>

          {/* Excel-style Table with White Interior Lines - No Header Text */}
          <div className="relative max-w-5xl mx-auto">
            <Card className={`${themeClasses.bgCard} max-w-5xl mx-auto rounded-lg overflow-hidden shadow-xl`}>
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
                                min="0"
                                max="9"
                                value={orderQuantities[person][flavor] || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  // Solo permitir números
                                  if (value === '' || /^[0-9]*$/.test(value)) {
                                    const numValue = parseInt(value) || 0;
                                    // Limitar a máximo 9
                                    if (numValue <= 9) {
                                      handleQuantityChange(person, flavor, value);
                                    }
                                  }
                                }}
                                className={`w-full h-8 text-center font-mono text-base ${themeClasses.inputBg} ${themeClasses.text} border-0 focus:outline-none focus:ring-1 focus:ring-[#6ccff6] transition-colors`}
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
              {(hasSelections() || customColumns.length > 0) && (
                <button
                  onClick={() => {
                    // Si hay columnas personalizadas, limpiarlas primero
                    if (customColumns.length > 0) {
                      clearCustomColumns();
                    }
                    // Luego limpiar todo el contenido
                    handleClearAll();
                    setShowSummary(false);
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
                title={customColumns.length >= maxCustomColumns ? "Máximo 6 gustos personalizados" : "Agregar gusto personalizado"}
              >
                Agregar Sabores
              </Button>
              {hasSelections() && (
                <Button
                  onClick={generateOrder}
                  className="bg-[#6ccff6]/60 text-white hover:bg-[#6ccff6]/70 font-semibold py-3 min-w-[80px] cursor-pointer shadow-md"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Generar Pedido
                </Button>
              )}
            </div>

            {/* Simple Order Summary */}
            {showSummary && (
              <Card className={`${themeClasses.bgCard} max-w-5xl mx-auto mt-4 shadow-xl rounded-lg overflow-hidden`}>
                <CardContent className="p-6">
                  {/* Header Section */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/20">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full bg-[#6ccff6]/20 flex items-center justify-center`}>
                        <MessageSquare className={`w-4 h-4 text-[#6ccff6]`} />
                      </div>
                      <div>
                        <h2 className={`text-xl font-bold ${themeClasses.text}`}>Resumen del Pedido</h2>
                        <p className={`text-sm ${themeClasses.textMuted}`}>Confirma y envía tu pedido</p>
                      </div>
                    </div>
                  </div>

                  {/* Provider Selector */}
                  <div className="mb-6 flex items-center gap-3">
                    <label className={`text-sm ${themeClasses.text} font-bold text-left`}>Seleccionar Proveedor:</label>
                    <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                      <SelectTrigger className={`w-[200px] ${themeClasses.cellBg} ${themeClasses.text} cursor-pointer border-transparent focus:ring-2 focus:ring-[#6ccff6] transition-all duration-200`}>
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
                      onClick={() => setShowSummary(false)}
                      variant="outline"
                      size="icon"
                      className={`cursor-pointer shadow-md ${themeClasses.border} ${themeClasses.text}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(orderSummary);
                      }}
                      size="icon"
                      className="bg-[#6ccff6]/90 text-[#141413] hover:bg-[#6ccff6]/100 cursor-pointer shadow-md"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={sendWhatsAppMessage}
                      size="icon"
                      className="bg-green-500/90 text-white hover:bg-green-500/100 cursor-pointer shadow-md"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Back to Portal Button - Same container as other buttons */}
            <div className="mt-6 max-w-5xl mx-auto flex justify-start">
              <Button
                onClick={() => {
                  // Guardar tema actual antes de navegar
                  localStorage.setItem('emp-theme', theme)
                  // Redirigir al portal
                  window.location.href = 'http://10.10.9.252'
                }}
                className={`${themeClasses.bgCard} ${themeClasses.text} border-2 ${themeClasses.border} hover:opacity-80 font-semibold py-3 px-3 cursor-pointer shadow-md`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Portal
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App