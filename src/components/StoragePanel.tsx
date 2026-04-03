import type { StorageItem } from '../types/storage';
import './StoragePanel.css';

export default function StoragePanel({
  items,
  loading = false,
  error = null,
}: {
  items: StorageItem[];
  loading?: boolean;
  error?: string | null;
}) {
  return (
    <section className="storage-panel" aria-label="Storage">
      <h2 className="storage-panel__title">Storage</h2>
      <p className="storage-panel__subtitle">Unlimited storage for now.</p>

      {error && (
        <p className="storage-panel__error" role="alert">
          {error}
        </p>
      )}

      {loading && <p className="storage-panel__loading">Loading storage…</p>}

      {!loading && !error && items.length === 0 && (
        <p className="storage-panel__empty">No items yet.</p>
      )}

      {!loading && !error && items.length > 0 && (
        <ul className="storage-panel__items">
          {items.map((item) => (
            <li key={item.itemKey} className="storage-panel__item">
              {item.itemImageUrl ? (
                <img
                  src={item.itemImageUrl}
                  alt={item.itemName}
                  className="storage-panel__img"
                />
              ) : (
                <div className="storage-panel__img storage-panel__img--placeholder">
                  No image
                </div>
              )}
              <div className="storage-panel__meta">
                <div className="storage-panel__name">{item.itemName}</div>
                <div className="storage-panel__qty">Qty: {item.quantity}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

