const sanitize = string => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  const reg = /[&<>"'/]/gi;
  return string.replace(reg, match => map[match]);
};

const hasValidMin = (value, min) => {
  return value.length >= min;
};

export function Input({ onSubmit, placeholder, label, defaultValue, onBlur }) {
  const handleBlur = () => {
    if (onBlur) onBlur();
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      const value = e.target.value.trim();

      if (!hasValidMin(value, 2)) return;

      onSubmit(sanitize(value));
      e.target.value = '';
    }
  };

  return (
    <div className="input-container">
      <input
        className="new-todo"
        id="todo-input"
        type="text"
        data-testid="text-input"
        autoFocus
        placeholder={placeholder}
        defaultValue={defaultValue}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
      <label className="visually-hidden" htmlFor="todo-input">
        {label}
      </label>
    </div>
  );
}
