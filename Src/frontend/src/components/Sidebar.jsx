import { useState, useEffect } from 'react'
import '../../css/style.css'

function Sidebar({ onFilterChange }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [priceRange, setPriceRange] = useState(200)

  useEffect(() => {
    onFilterChange({
      searchTerm,
      category: selectedCategory,
      maxPrice: priceRange
    })
  }, [searchTerm, selectedCategory, priceRange, onFilterChange])

  const handleCategoryClick = (category) => {
    if (selectedCategory === category) {
      setSelectedCategory(null)
    } else {
      setSelectedCategory(category)
    }
  }

  return (
    <aside className="barra-lateral-filtros">
      <div className="secao-filtro">
        <h3 className="titulo-filtro">FILTROS:</h3>
        <input
          type="text"
          id="gameSearchInput"
          placeholder="Pesquisar jogos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="categorias-filtro">
          <button
            className={`botao-filtro ${selectedCategory === 'rpg' ? 'ativo' : ''}`}
            data-category="rpg"
            onClick={() => handleCategoryClick('rpg')}
          >
            RPG
          </button>
          <button
            className={`botao-filtro ${selectedCategory === 'fps' ? 'ativo' : ''}`}
            data-category="fps"
            onClick={() => handleCategoryClick('fps')}
          >
            FPS
          </button>
          <button
            className={`botao-filtro ${selectedCategory === 'mmorpg' ? 'ativo' : ''}`}
            data-category="mmorpg"
            onClick={() => handleCategoryClick('mmorpg')}
          >
            MMORPG
          </button>
        </div>
      </div>
      <div className="secao-filtro">
        <h3 className="titulo-filtro">FAIXA DE PREÇO</h3>
        <div className="faixa-preco">
          <input
            type="range"
            className="slider-preco"
            min={0}
            max={200}
            value={priceRange}
            onChange={(e) => setPriceRange(parseFloat(e.target.value))}
          />
          <div className="rotulos-preco">
            <span>R$ 0</span>
            <span>R$ 200</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar

