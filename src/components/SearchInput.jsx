import { Search } from 'lucide-react';

import '../styles/components/SearchInput.scss';

const SearchInput = ({
  value,
  onChange,
  placeholder = "Search...",
  buttonPosition = "none", // "left", "right", or "none"
  onButtonClick,
  buttonLabel = <Search size={16} />,
}) => {
  return (
    <div className={`search-input-container ${buttonPosition}`}>
      {buttonPosition === "left" && (
        <button type="button" onClick={onButtonClick} className="search-button">
          {buttonLabel}
        </button>
      )}

      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />

      {buttonPosition === "right" && (
        <button type="button" onClick={onButtonClick} className="search-button">
          {buttonLabel}
        </button>
      )}
    </div>
  );
};

export default SearchInput;