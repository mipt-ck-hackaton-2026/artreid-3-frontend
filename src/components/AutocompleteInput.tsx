import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import './Layout.css';

interface AutocompleteInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  fetchOptions: (query: string, signal: AbortSignal) => Promise<{ data: string[] }>;
  debounceMs?: number;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  fetchOptions,
  debounceMs = 300,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [options, setOptions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadOptions = useCallback(async (query: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setIsOpen(true);

    try {
      const response = await fetchOptions(query, abortControllerRef.current.signal);
      setOptions(response.data);
    } catch (err) {
      if (!axios.isCancel(err)) {
        console.error('Failed to fetch autocomplete options:', err);
        setOptions([]);
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, [fetchOptions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setInputValue(newVal);
    onChange(newVal);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      loadOptions(newVal);
    }, debounceMs);
  };

  const handleSelect = (option: string) => {
    setInputValue(option);
    onChange(option);
    setIsOpen(false);
    setOptions([]);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="filter-group" ref={containerRef}>
      {label && <label>{label}</label>}
      <div className="autocomplete-container">
        <input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => loadOptions(inputValue)}
        />
        {isOpen && (
          <ul className="autocomplete-dropdown">
            {loading ? (
              <li className="autocomplete-loading">Searching...</li>
            ) : options.length > 0 ? (
              options.map((opt, i) => (
                <li key={i} className="autocomplete-item" onClick={() => handleSelect(opt)}>
                  {opt}
                </li>
              ))
            ) : (
              <li className="autocomplete-no-results">No results found</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AutocompleteInput;
