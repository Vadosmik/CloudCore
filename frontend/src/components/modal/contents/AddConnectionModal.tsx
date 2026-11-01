import { useState, type FormEvent } from "react";

import { createConnections } from "../../../service/connectionService";
import type { ConnectionProvider } from "../../../types/connections";
import type { ModalContentProps } from "../types";
import { Input } from "../../ui/input/Input";
import { Select } from "../../ui/input/Select";
import Button from "../../ui/button/Button";

export default function AddConnectionModal({
  close,
  onChanged,
}: ModalContentProps) {
  const [name, setName] = useState("");
  const [provider, setProvider] = useState<ConnectionProvider>("AWS");
  const [accessKeyId, setAccessKeyId] = useState("");
  const [secretAccessKey, setSecretAccessKey] = useState("");
  const [region, setRegion] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const credentials =
      provider === "AWS"
        ? JSON.stringify({
            aws_access_key_id: accessKeyId.trim(),
            aws_secret_access_key: secretAccessKey.trim(),
            region: region.trim(),
          })
        : "";

    try {
      await createConnections({
        name: name.trim(),
        provider,
        credentials,
      });
      onChanged();
      close();
    } catch (error) {
      console.error("Error adding connection: ", error);
    }
  };

  return (
    <form className="modal-form" onSubmit={handleSubmit}>
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
        <p>GCp</p>
      )}

      <div className="modal-actions">
        <Button title="Cancel" onClick={close} />
        <Button title="Save" type="submit" className="primary" />
      </div>
    </form>
  );
}
