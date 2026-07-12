import { useRef, useMemo, useCallback } from 'react';
import { Input } from '../ui/input';

function getDefaultDisplayName(user) {
  if (!user) return '';
  return user.userNickName || user.name || user.userName || '';
}

function UserAutocomplete({
  users = [],
  value = '',
  onChange,
  onSelect,
  placeholder = 'Rechercher...',
  className = '',
  disabled = false,
  getDisplayName = getDefaultDisplayName,
  ...props
}) {
  const inputRef = useRef(null);
  const prevLengthRef = useRef(value.length);

  const bestMatch = useMemo(() => {
    if (!value || !value.trim()) return null;
    const q = value.toLowerCase();
    return users.find(u => {
      const name = (getDisplayName(u) || '').toLowerCase();
      return name.startsWith(q);
    }) || null;
  }, [users, value, getDisplayName]);

  const suggestionName = bestMatch ? getDisplayName(bestMatch) : '';
  const suffix = bestMatch && suggestionName.toLowerCase().startsWith((value || '').toLowerCase())
    ? suggestionName.slice(value.length)
    : '';

  const accept = useCallback(() => {
    if (bestMatch) {
      onChange(suggestionName);
      onSelect(bestMatch);
      if (inputRef.current) {
        inputRef.current.setSelectionRange(suggestionName.length, suggestionName.length);
      }
    }
  }, [bestMatch, suggestionName, onChange, onSelect]);

  const handleChange = (e) => {
    const raw = e.target.value;

    if (raw.length < prevLengthRef.current) {
      onChange(raw);
      prevLengthRef.current = raw.length;
      return;
    }
    prevLengthRef.current = raw.length;

    onChange(raw);

    if (raw) {
      const q = raw.toLowerCase();
      const match = users.find(u => {
        const name = (getDisplayName(u) || '').toLowerCase();
        return name.startsWith(q);
      });

      if (match) {
        const fullName = getDisplayName(match);
        if (fullName.toLowerCase() !== raw.toLowerCase()) {
          onChange(fullName);
          onSelect(match);
          prevLengthRef.current = fullName.length;
          requestAnimationFrame(() => {
            if (inputRef.current) {
              inputRef.current.setSelectionRange(raw.length, fullName.length);
            }
          });
        } else {
          onSelect(match);
        }
      }
    }
  };

  return (
    <Input
      ref={inputRef}
      value={value}
      onChange={handleChange}
      onKeyDown={e => {
        if ((e.key === 'Tab' || e.key === 'Enter') && suffix) {
          e.preventDefault();
          accept();
        }
      }}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      autoComplete="off"
      {...props}
    />
  );
}

export { UserAutocomplete };
