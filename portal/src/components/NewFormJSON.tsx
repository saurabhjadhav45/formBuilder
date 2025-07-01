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
    const [title, setTitle] = useState("");
    const [name, setName] = useState("");
    const [path, setPath] = useState("");
    const [display, setDisplay] = useState("form");
    const [tags, setTags] = useState("");

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

        parsed.title = title || parsed.title;
        parsed.name = name || parsed.name;
        parsed.path = path || parsed.path;
        parsed.display = display || parsed.display || "form";
        parsed.type = parsed.type || "form";
        parsed.tags = tags
            ? tags.split(",").map((t) => t.trim()).filter(Boolean)
            : parsed.tags || [];

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
            <div className="panel new-item">
                <div className="edit-form-header">
                    <div className="edit-form-header-left">
                        <div className="formio-component form-group lateral">
                            <label htmlFor="title">Form Title</label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="formio-component form-group lateral">
                            <label htmlFor="name">Form Name</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="formio-component form-group lateral">
                            <label htmlFor="path">Path</label>
                            <input
                                id="path"
                                type="text"
                                value={path}
                                onChange={(e) => setPath(e.target.value)}
                            />
                        </div>
                        <div className="formio-component form-group lateral">
                            <label htmlFor="display">Display As</label>
                            <select
                                id="display"
                                value={display}
                                onChange={(e) => setDisplay(e.target.value)}
                            >
                                <option value="form">Form</option>
                                <option value="wizard">Wizard</option>
                            </select>
                        </div>
                        <div className="formio-component form-group lateral">
                            <label htmlFor="tags">Tags</label>
                            <input
                                id="tags"
                                type="text"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <div style={{ padding: "15px" }}>
                    <div className="mb-2">
                        <small>
                            Paste a Form.io form JSON including a components array.
                        </small>
                    </div>
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
        </div>
    );
};

export default NewFormJSON;
