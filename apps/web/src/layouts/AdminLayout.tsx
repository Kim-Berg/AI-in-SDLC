import { Link, Outlet } from 'react-router-dom';

/**
 * Admin layout shell — sidebar + content area.
 * Admin pages (e.g., review moderation panel) will be added here during demos.
 */
export function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__title">ZAVA Admin</div>
        <nav className="admin-sidebar__nav">
          <Link to="/admin" className="admin-sidebar__link">
            Dashboard
          </Link>
          {/* Additional admin nav links will be added by Copilot agent demos */}
        </nav>
      </aside>
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}
