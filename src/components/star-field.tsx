export function StarField() {
  return (
    <div className="pend-stars" aria-hidden="true">
      {[...Array(18)].map((_, i) => (
        <svg
          key={i}
          className={`pend-star pend-star--${i + 1}`}
          viewBox="0 0 10 10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5,0 L5.6,4.4 L10,5 L5.6,5.6 L5,10 L4.4,5.6 L0,5 L4.4,4.4 Z" fill="white" />
        </svg>
      ))}
    </div>
  );
}
