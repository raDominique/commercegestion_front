import { useMemo, useRef, useState } from 'react';
import { Input } from '../ui/input';

const getEmail = (member) => member?.userEmail || member?.email || '';
const getMemberId = (member) => member?.userId || '';

/**
 * Selects a member from a searchable list. Search terms match the member ID,
 * email address, or display name; the caller owns the selected member state.
 */
function MemberCombobox({
  members = [],
  value = '',
  onChange,
  onSelect,
  getDisplayName = (member) => member?.userNickName || member?.name || member?.userName || '',
  placeholder = 'Rechercher par ID membre ou e-mail...',
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const blurTimeoutRef = useRef(null);

  const matches = useMemo(() => {
    const query = value.trim().toLowerCase();
    if (!query) return members.slice(0, 8);

    return members.filter((member) => {
      const searchable = [getMemberId(member), getEmail(member), getDisplayName(member)]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return searchable.includes(query);
    }).slice(0, 8);
  }, [members, value, getDisplayName]);

  const selectMember = (member) => {
    onChange(getEmail(member) || getMemberId(member));
    onSelect(member);
    setOpen(false);
  };

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          clearTimeout(blurTimeoutRef.current);
          setOpen(true);
        }}
        onBlur={() => {
          blurTimeoutRef.current = setTimeout(() => setOpen(false), 150);
        }}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls="member-combobox-options"
        className="bg-white"
      />
      {open && !disabled && (
        <div id="member-combobox-options" role="listbox" className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-neutral-200 bg-white py-1 shadow-lg">
          {matches.length > 0 ? matches.map((member) => {
            const id = member?._id || member?.id || member?.userId;
            const email = getEmail(member);
            return (
              <button
                key={id}
                type="button"
                role="option"
                className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 focus:bg-neutral-100 focus:outline-none"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectMember(member)}
              >
                <span className="block font-medium text-neutral-900">{getDisplayName(member) || email || getMemberId(member)}</span>
                <span className="block text-xs text-neutral-600">{[email, getMemberId(member)].filter(Boolean).join(' · ')}</span>
              </button>
            );
          }) : (
            <p className="px-3 py-2 text-sm text-neutral-500">Aucun membre correspondant.</p>
          )}
        </div>
      )}
    </div>
  );
}

export { MemberCombobox };
