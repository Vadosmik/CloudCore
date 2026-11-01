import { useEffect, useState } from "react";
import "./ConnectionsPage.css";

import {
  getConnections,
  deleteConnections,
} from "../service/connectionService";
import { useHashModal } from "../components/modal/useHashModal";
import type { Connection } from "../types/connections";

import { FiPlus, FiTrash } from "react-icons/fi";
import IconButton from "../components/ui/button/IconButton";

interface ConnectionsProps {
  version: number;
  refresh: () => void;
}

export default function Connections({ version }: ConnectionsProps) {
  // refresh
  const { open } = useHashModal();
  const [connections, setConnections] = useState<Connection[]>([]);

  const loadConnections = async () => {
    try {
      setConnections(await getConnections());
    } catch (err) {
      console.error("Error loading connections:", err);
    }
  };

  useEffect(() => {
    loadConnections();
  }, [version]);

  const handleDelete = async (connection: Connection) => {
    if (
      !window.confirm(
        `Delete "${connection.name}"? Its resources and metrics will be deleted too.`,
      )
    )
      return;

    try {
      await deleteConnections(connection.id);
      await loadConnections();
    } catch (error) {
      console.error("Error deleting connection:", error);
    }
  };

  return (
    <div className="connection-container">
      <div className="section-header">
        <span className="section-title lg">Connections</span>
        <IconButton
          title="Add new connection"
          icon={<FiPlus />}
          onClick={() => open("add-connection")}
        />
      </div>

      {connections.length === 0 ? (
        <p>No connections found.</p>
      ) : (
        <div className="connection-list">
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
