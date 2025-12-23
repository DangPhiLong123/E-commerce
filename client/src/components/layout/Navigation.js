import React, { useState, useRef, useEffect } from "react";
import { navigation } from 'ultils/contants'
import { NavLink, useNavigate, createSearchParams, useSearchParams } from "react-router-dom"
import { FaSearch } from 'react-icons/fa'
import useI18n from 'hooks/useI18n'
import useDebounce from 'hooks/useDebounce'
import { apiGetProducts } from 'apis/product'

const Navigation = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { t } = useI18n()
  const searchRef = useRef(null)
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const currentParams = Object.fromEntries(params.entries())
      navigate({
        pathname: '/products',
        search: createSearchParams({
          ...currentParams,
          q: searchQuery.trim(),
          page: 1
        }).toString()
      })
      setSearchQuery('')
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion)
    setShowSuggestions(false)
    const currentParams = Object.fromEntries(params.entries())
    navigate({
      pathname: '/products',
      search: createSearchParams({
        ...currentParams,
        q: suggestion,
        page: 1
      }).toString()
    })
  }

  // Fetch search suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedSearchQuery && debouncedSearchQuery.length > 2) {
        try {
          // Gọi API để lấy suggestions thật
          const response = await apiGetProducts({
            q: debouncedSearchQuery,
            limit: 5,
            fields: 'title,brand,category'
          });
          
          if (response?.success && response.products) {
            // Lấy unique suggestions từ title, brand, category
            const uniqueSuggestions = new Set();
            response.products.forEach(product => {
              if (product.title) uniqueSuggestions.add(product.title);
              if (product.brand) uniqueSuggestions.add(product.brand);
              if (product.category) uniqueSuggestions.add(product.category);
            });
            
            // Chuyển Set thành Array và giới hạn 5 suggestions
            const suggestionsArray = Array.from(uniqueSuggestions).slice(0, 5);
            setSuggestions(suggestionsArray);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          // Fallback to mock data
          const mockSuggestions = [
            'iPhone', 'Samsung', 'Laptop', 'Tablet', 'Camera', 'Speaker', 'Headphone'
          ].filter(item => 
            item.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
          );
          setSuggestions(mockSuggestions);
          setShowSuggestions(true);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [debouncedSearchQuery])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden lg:flex w-full max-w-[1220px] mx-auto px-4 h-auto lg:h-[48px] py-2 border-y text-sm flex-col lg:flex-row items-center justify-between gap-4 lg:gap-0">
        <div className="flex items-center">
          {navigation.map(el => (
            <NavLink
              to={el.path}
              key={el.id}
              className={({ isActive }) => isActive ? 'pr-12 hover:text-main text-main' : 'pr-12 hover:text-main'}
            >
              {t(el.textKey)}
            </NavLink>
          ))}
        </div>
        <div ref={searchRef} className="relative">
          <form onSubmit={handleSearch} className="flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(suggestions.length > 0)}
              placeholder="Search products..."
              className="px-4 py-1 border rounded-l-md focus:outline-none focus:border-main w-[300px]"
            />
            <button
              type="submit"
              className="px-4 py-1 bg-main text-white rounded-r-md hover:bg-main/90 flex items-center justify-center min-w-[45px]"
            >
              <FaSearch />
            </button>
          </form>
          
          {/* Search Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-40 mt-1">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center gap-2">
                    <FaSearch className="text-gray-400 text-sm" />
                    <span className="text-sm">{suggestion}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="lg:hidden w-full px-4 py-2 border-b">
        <div ref={searchRef} className="relative">
          <form onSubmit={handleSearch} className="flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(suggestions.length > 0)}
              placeholder="Search products..."
              className="px-4 py-2 border rounded-l-md focus:outline-none focus:border-main w-full"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-main text-white rounded-r-md hover:bg-main/90 flex items-center justify-center min-w-[50px]"
            >
              <FaSearch />
            </button>
          </form>
          
          {/* Mobile Search Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-40 mt-1">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center gap-2">
                    <FaSearch className="text-gray-400 text-sm" />
                    <span className="text-sm">{suggestion}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
};

export default Navigation;
