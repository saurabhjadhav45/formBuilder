import { Formio } from "@formio/js";
import { useState, ChangeEvent } from "react";
import { useHashLocation } from "wouter/use-hash-location";
import { useBodyClassName } from "../hooks/useBodyClassName";

export const NewFormJSON = () => {
    useBodyClassName("item-open");
    const setLocation = useHashLocation()[1];
    const [jsonText, setJsonText] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    const readFile = async (f: File) => {
        const text = await f.text();
        setJsonText(text);
    };

    const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files && e.target.files[0];
        setFile(f || null);
        if (f) {
            readFile(f);
        }
    };

    const handleSubmit = async () => {
        const input = jsonText.trim();
        if (!input) {
            setError("JSON input required");
            return;
        }
        let parsed;
        try {
            parsed = JSON.parse(input);
        } catch (e) {
            setError("Invalid JSON");
            return;
        }
        try {
            const created = await Formio.request("/form", "POST", parsed);
            setLocation(`/form/${created._id}/edit`);
        } catch (err: any) {
            setError(err.message || "Failed to create form");
        }
    };

    return (
        <div className="panel-wrap content fio-card remember-focus-content new-item active form">
            <div className="panel-header">
                <div className="panel-header-section top">
                    <div className="panel-title icon">
                        <img src="icon-form.svg" alt="form Icon" /> Create Form via JSON
                    </div>
                    <button className="close-button close-item transition last-focused" onClick={() => setLocation("/")}> 
                        <i className="ri-close-line"></i>
                    </button>
                </div>
            </div>
            <div className="panel new-item" style={{ padding: "15px" }}>
                <div className="mb-2">
                    <textarea
                        placeholder="Paste form JSON here..."
                        value={jsonText}
                        onChange={(e) => setJsonText(e.target.value)}
                        style={{ width: "100%", height: "200px" }}
                    />
                </div>
                <div className="mb-2">
                    <input
                        type="file"
                        accept="application/json"
                        onChange={handleFile}
                    />
                </div>
                {error && <div className="error" role="alert">{error}</div>}
                <div className="save-form-bar button-wrap" style={{ justifyContent: "end" }}>
                    <button className="button save-form" onClick={handleSubmit}>Create Form</button>
                </div>
            </div>
        </div>
    );
};

export default NewFormJSON;
