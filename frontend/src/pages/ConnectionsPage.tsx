import { useCallback, useEffect, useState } from "react";
import "./ConnectionsPage.css";

import { getConnections, deleteConnections } from "../service/connectionService";
import { useHashModal } from "../components/modal/useHashModal";
import type { Connection } from "../types/connections";

import { FiPlus, FiTrash } from "react-icons/fi";
import IconButton from "../components/ui/button/IconButton";
import { useInvalidate, useVersion } from "../context/RefreshContext";
import Button from "../components/ui/button/Button";

export default function ConnectionsPage() {
  const connectionsVersion = useVersion("connections");
  const { open } = useHashModal();
  const invalidate = useInvalidate();

  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const loadConnections = useCallback(async () => {
    setLoadError(false);
    try {
      const data = await getConnections();
      setConnections(data);
    } catch (err) {
      console.error("Error loading connections:", err);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConnections();
  }, [connectionsVersion, loadConnections]);

  const handleDelete = async (connection: Connection) => {
    if (
      !window.confirm(`Delete "${connection.name}"? Its resources and metrics will be deleted too.`)
    )
      return;

    try {
      await deleteConnections(connection.id);
      invalidate("connections");
    } catch (error) {
      console.error("Error deleting connection:", error);
    }
  };

  return (
    <div className="page connection-page">
      <header className="page__header">
        <h1 className="page__title">Connections</h1>
        <IconButton
          title="Add connection"
          icon={<FiPlus />}
          onClick={() => open("add-connection")}
        />
      </header>

      {loading ? (
        <p className="page__message">Loading connections...</p>
      ) : loadError ? (
        <div className="page__message">
          <p>Could not load your connections.</p>
          <Button onClick={loadConnections}>Try again</Button>
        </div>
      ) : connections.length === 0 ? (
        <div className="page__empty">
          <h2>No connections yet</h2>
          <Button variant="primary" onClick={() => open("add-connection")}>
            <FiPlus />
            Add your first connection
          </Button>
        </div>
      ) : (
        <div className="connection-page__list">
          {connections.map((connection) => (
            <div key={connection.id} className="connection-page__item">
              <div className="connection-page__meta">
                <span
                  className={`connection-page__provider connection-page__provider--${connection.provider.toLowerCase()}`}
                >
                  {connection.provider}
                </span>
                <span>{connection.name}</span>
              </div>
              <IconButton
                variant="danger"
                title="Delete connection"
                icon={<FiTrash />}
                onClick={() => handleDelete(connection)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
