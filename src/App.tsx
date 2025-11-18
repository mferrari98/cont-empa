import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Moon, Sun, Shield, Trash2, MessageSquare, Copy, X, ArrowLeft, Send } from "lucide-react"

interface OrderQuantities {
  [key: string]: {
    [key: string]: number
  }
}

const people = ['Antonio', 'Hugo', 'Martín', 'Pablo', 'Javier', 'Matías', 'Redondeo']
const flavors = ['Carne', 'Carne Pic.', 'Pollo', 'Pollo Pic.', 'JyQ', 'Caprese', 'Fugazetta']

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
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

  // Apply dark mode class to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  const sendWhatsAppMessage = () => {
    const provider = providers.find(p => p.name === selectedProvider)
    if (provider) {
      const encodedMessage = encodeURIComponent(orderSummary)
      const whatsappUrl = `https://wa.me/${provider.phone.replace(/\D/g, '')}?text=${encodedMessage}`
      window.open(whatsappUrl, '_blank')
    }
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

    // Calculate totals for each flavor
    flavors.forEach(flavor => {
      let total = 0
      people.forEach(person => {
        total += orderQuantities[person][flavor] || 0
      })
      flavorTotals[flavor] = total
    })

    // Generate simple order text
    const orderItems: string[] = []
    let totalEmpanadas = 0
    flavors.forEach(flavor => {
      const count = flavorTotals[flavor]
      if (count > 0) {
        totalEmpanadas += count
        // Replace 'Pic.' with 'picante' for display
        const displayName = flavor.toLowerCase().replace('pic.', 'picante')
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
            <Card className={`${themeClasses.bgCard} max-w-5xl mx-auto rounded-lg overflow-hidden`}>
              <CardContent className="px-4 py-2">
                <div className="overflow-x-auto">
                  <table className="w-full border-separate border-spacing-0">
                    <thead>
                      <tr className={`${themeClasses.bgCard}`}>
                        <th className={`w-24 font-bold text-left border-b ${themeClasses.tableBorderLight} ${themeClasses.text} text-sm px-3 py-3`}>

                        </th>
                        {flavors.map((flavor) => (
                          <th
                            key={flavor}
                            className={`font-bold text-center border-b border-l ${themeClasses.tableBorderLight} ${themeClasses.text} text-sm px-2 py-3 min-w-[80px]`}
                          >
                            {flavor}
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
                          {flavors.map((flavor) => (
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

            {/* Generate Order Button */}
            <div className="mt-3 max-w-5xl mx-auto flex justify-end gap-3">
              {hasSelections() && (
                <Button
                  onClick={() => {
                    handleClearAll();
                    setShowSummary(false);
                  }}
                  className="bg-white text-black hover:bg-gray-100 font-semibold py-3 min-w-[80px] cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpiar
                </Button>
              )}
              <Button
                onClick={generateOrder}
                className="bg-[#6ccff6] text-[#141413] hover:bg-[#5ab8e6] font-semibold py-3 min-w-[80px] cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Generar Pedido
              </Button>
            </div>

            {/* Simple Order Summary */}
            {showSummary && (
              <Card className={`${themeClasses.bgCard} max-w-5xl mx-auto mt-4`}>
                <CardContent className="p-4">
                  <h2 className={`text-lg font-semibold mb-3 ${themeClasses.text}`}>Pedido:</h2>

                  {/* Provider Selector */}
                  <div className="mb-4 flex items-center gap-3">
                    <label className={`text-sm font-medium ${themeClasses.text}`}>Proveedor:</label>
                    <select
                      value={selectedProvider}
                      onChange={(e) => setSelectedProvider(e.target.value)}
                      className={`px-3 py-2 rounded-md ${themeClasses.inputBg} ${themeClasses.text} border ${themeClasses.border} focus:outline-none focus:ring-1 focus:ring-[#6ccff6] cursor-pointer`}
                    >
                      {providers.map(provider => (
                        <option key={provider.name} value={provider.name}>
                          {provider.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={`p-3 rounded-md ${themeClasses.inputBg} border ${themeClasses.borderLight}`}>
                    <p className={`${themeClasses.text} font-mono leading-relaxed`}>
                      {orderSummary}
                    </p>
                  </div>

                  <div className="mt-3 flex justify-end gap-3">
                    <Button
                      onClick={() => setShowSummary(false)}
                      className="bg-white text-black hover:bg-gray-100 font-semibold px-4 py-2 cursor-pointer"
                      style={{ color: 'black' }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(orderSummary);
                      }}
                      className="bg-[#6ccff6] text-[#141413] hover:bg-[#5ab8e6] font-semibold px-4 py-2 cursor-pointer"
                      style={{ color: '#141413' }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={sendWhatsAppMessage}
                      className="bg-green-500 text-white hover:bg-green-600 font-semibold px-4 py-2 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Back to Portal Button - Same container as other buttons */}
            <div className="mt-6 max-w-5xl mx-auto flex justify-start">
              <a
                href="http://10.10.9.252"
              >
                <Button
                  className={`${themeClasses.bgCard} ${themeClasses.text} border-2 ${themeClasses.border} hover:opacity-80 font-semibold py-3 px-3 cursor-pointer`}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al Portal
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
  )
}

export default App