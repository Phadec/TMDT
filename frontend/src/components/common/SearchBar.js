import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  
  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions (simulated for now)
  const fetchSuggestions = async (text) => {
    if (!text.trim()) {
      setSuggestions([]);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real application, you would fetch suggestions from your API
      // This is just a simulation with popular search terms
      setTimeout(() => {
        const mockSuggestions = [
          { id: 1, text: `${text} điện thoại` },
          { id: 2, text: `${text} laptop` },
          { id: 3, text: `${text} máy tính bảng` },
          { id: 4, text: `${text} đồng hồ thông minh` }
        ];
        
        setSuggestions(mockSuggestions);
        setIsLoading(false);
      }, 300);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    // Fetch suggestions after a short delay
    const handler = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
    
    return () => {
      clearTimeout(handler);
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsFocused(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.text);
    navigate(`/search?q=${encodeURIComponent(suggestion.text)}`);
    setIsFocused(false);
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
  };

  return (
    <div className="search-bar-container" ref={searchRef}>
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrapper">
          <i className="fas fa-search search-icon"></i>
          <input
            type="text"
            value={query}
            onChange={handleChange}
            placeholder="Tìm kiếm sản phẩm..."
            className="search-input"
            onFocus={() => setIsFocused(true)}
          />
          {query && (
            <button 
              type="button" 
              className="clear-search-btn"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
          <button type="submit" className="search-button">
            Tìm kiếm
          </button>
        </div>
        
        {isFocused && (
          <div className="search-suggestions">
            {isLoading ? (
              <div className="suggestion-loading">
                <div className="suggestion-spinner"></div>
                <span>Đang tìm kiếm...</span>
              </div>
            ) : suggestions.length > 0 ? (
              <ul className="suggestion-list">
                {suggestions.map((suggestion) => (
                  <li 
                    key={suggestion.id} 
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <i className="fas fa-search suggestion-icon"></i>
                    <span>{suggestion.text}</span>
                  </li>
                ))}
              </ul>
            ) : query.trim() ? (
              <div className="no-suggestions">
                Không có gợi ý cho từ khóa này
              </div>
            ) : null}
            
            <div className="popular-searches">
              <h4>Tìm kiếm phổ biến</h4>
              <div className="popular-tags">
                <button type="button" onClick={() => handleSuggestionClick({ text: 'điện thoại' })}>
                  điện thoại
                </button>
                <button type="button" onClick={() => handleSuggestionClick({ text: 'laptop' })}>
                  laptop
                </button>
                <button type="button" onClick={() => handleSuggestionClick({ text: 'đồng hồ' })}>
                  đồng hồ
                </button>
                <button type="button" onClick={() => handleSuggestionClick({ text: 'xe máy' })}>
                  xe máy
                </button>
                <button type="button" onClick={() => handleSuggestionClick({ text: 'nhà thuê' })}>
                  nhà thuê
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;
