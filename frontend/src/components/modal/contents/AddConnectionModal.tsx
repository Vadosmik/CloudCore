import { useState, type FormEvent } from "react";

import { createConnections } from "../../../service/connectionService";
import type { ConnectionProvider } from "../../../types/connections";
import type { ModalContentProps } from "../types";
import { Input } from "../../ui/input/Input";
import { Select } from "../../ui/input/Select";
import Button from "../../ui/button/Button";
import { useInvalidate } from "../../../context/RefreshContext";
import { Textarea } from "../../ui/input/Textarea";

export default function AddConnectionModal({ close }: ModalContentProps) {
  const [name, setName] = useState("");
  const [provider, setProvider] = useState<ConnectionProvider>("AWS");
  const [accessKeyId, setAccessKeyId] = useState("");
  const [secretAccessKey, setSecretAccessKey] = useState("");
  const [region, setRegion] = useState("");

  const [gcpKey, setGcpKey] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const invalidate = useInvalidate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setError(null);

    let credentials = "";

    if (provider === "AWS") {
      credentials = JSON.stringify({
        aws_access_key_id: accessKeyId.trim(),
        aws_secret_access_key: secretAccessKey.trim(),
        region: region.trim(),
      });
    } else {
      try {
        const key = JSON.parse(gcpKey);

        if (key.type !== "service_account" || !key.project_id || !key.private_key) {
          setError("This is not a valid service account key.");
          setSaving(false);
          return;
        }

        credentials = JSON.stringify(key);
      } catch {
        setError("Key must be valid JSON.");
        setSaving(false);
        return;
      }
    }

    try {
      await createConnections({
        name: name.trim(),
        provider,
        credentials,
      });
      invalidate("connections");
      close();
    } catch (error) {
      console.error("Error adding connection: ", error);
      setError("Could not add the connection. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="modal__form" onSubmit={handleSubmit}>
      <Input
        label="Connection name"
        value={name}
        maxLength={100}
        autoFocus
        required
        onChange={(e) => setName(e.target.value)}
      />
      <Select
        label="Provider"
        value={provider}
        onChange={(e) => setProvider(e.target.value as ConnectionProvider)}
      >
        <option value="AWS">AWS</option>
        <option value="GCP">GCP</option>
      </Select>
      {provider === "AWS" ? (
        <>
          <Input
            label="Access key id"
            name="aws_access_key_id"
            type="text"
            value={accessKeyId}
            onChange={(e) => setAccessKeyId(e.target.value)}
            autoComplete="off"
            required
          />
          <Input
            label="Secret access key"
            name="aws_secret_access_key"
            type="password"
            value={secretAccessKey}
            onChange={(e) => setSecretAccessKey(e.target.value)}
            autoComplete="off"
            required
          />
          <Input
            label="Region"
            name="region"
            type="text"
            placeholder="eu-central-1"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            autoComplete="off"
            required
          />
        </>
      ) : (
        <>
          <input
            type="file"
            accept="application/json,.json"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) setGcpKey(await file.text());
            }}
          />
          <Textarea
            label="Service account key (JSON)"
            value={gcpKey}
            onChange={(e) => setGcpKey(e.target.value)}
            placeholder='{ "type": "service_account", "project_id": "...", ... }'
            rows={6}
            spellCheck={false}
            required
          />
        </>
      )}

      {error && <p className="modal__error">{error}</p>}

      <div className="modal__actions">
        <Button onClick={close}>Cancel</Button>
        <Button type="submit" variant="primary" disabled={saving || !name.trim()}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
