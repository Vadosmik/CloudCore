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
    <div className="connection-page">
      <header className="connection-page__header">
        <h1 className="connection-page__title">Connections</h1>
        <IconButton
          title="Add connection"
          icon={<FiPlus />}
          onClick={() => open("add-connection")}
        />
      </header>

      {loading ? (
        <p className="connection-page__message">Loading connections...</p>
      ) : loadError ? (
        <div className="page__message">
          <p>Could not load your connections.</p>
          <Button onClick={loadConnections} title={""}>
            Try again
          </Button>
        </div>
      ) : connections.length === 0 ? (
        <div className="page__empty">
          <h2>No connections yet</h2>
          <Button variant="primary" onClick={() => open("add-connection")}>
            <FiPlus />
            Add your first connections
          </Button>
        </div>
      ) : (
        <div className="connection-page__list">
          {connections.map((connection) => (
            <div key={connection.id} className="connection-item">
              <div className="connection-meta">
                <span
                  className="connection-provider"
                  style={
                    connection.provider === "AWS"
                      ? { color: "#FF9900" }
                      : connection.provider === "GCP"
                        ? { color: "#4285F4" }
                        : {}
                  }
                >
                  {connection.provider}
                </span>
                <span>{connection.name}</span>
              </div>
              <IconButton
                className="danger"
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
