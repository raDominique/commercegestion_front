import { Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Loader } from '../ui/loader';
import { isCompleteEmail } from '../../utils/emailValidation';

function MemberIdLookupInput({
  value,
  onChange,
  onSearch,
  onSearchEmail,
  searchMode = 'id',
  onSearchModeChange,
  emailLookupLoading = false,
  placeholder = 'ID membre (8 caractères) ou e-mail',
  className = '',
  ...inputProps
}) {
  const canSearch = searchMode === 'email'
    ? isCompleteEmail(value)
    : String(value || '').trim().length === 8;

  const handleSearch = () => {
    if (typeof onSearch === 'function') {
      onSearch(value, searchMode);
      return;
    }
    if (typeof onSearchEmail === 'function') {
      onSearchEmail(String(value || '').trim());
    }
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <div className="w-full sm:w-40">
        <select
          value={searchMode}
          onChange={(event) => onSearchModeChange?.(event.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        >
          <option value="id">ID Membre</option>
          <option value="email">E-mail</option>
        </select>
      </div>
      <Input
        {...inputProps}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`min-w-0 flex-1 ${className}`}
      />
      <Button
        type="button"
        variant="outline"
        className="shrink-0"
        disabled={!canSearch || emailLookupLoading}
        onClick={handleSearch}
      >
        {emailLookupLoading
          ? <Loader size="sm" className="border-current border-t-transparent" />
          : <Search size={16} aria-hidden="true" />}
        Rechercher
      </Button>
    </div>
  );
}

export { MemberIdLookupInput };
