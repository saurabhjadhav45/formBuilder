import { Formio } from "@formio/js";
import { useState, ChangeEvent } from "react";
import { useHashLocation } from "wouter/use-hash-location";
import { useBodyClassName } from "../hooks/useBodyClassName";

const slugify = (str: string) =>
    str
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

export const NewFormJSON = () => {
    useBodyClassName("item-open");
    const setLocation = useHashLocation()[1];
    const [title, setTitle] = useState("");
    const [name, setName] = useState("");
    const [path, setPath] = useState("");
    const [display, setDisplay] = useState("form");
    const [tags, setTags] = useState("");
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
        let parsed: any;
        try {
            parsed = JSON.parse(input);
        } catch (e) {
            setError("Invalid JSON");
            return;
        }

        parsed = { components: [], ...parsed };
        parsed.title = title || parsed.title;
        parsed.display = display || parsed.display || "form";
        parsed.tags =
            (tags
                ? tags
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean)
                : parsed.tags) || [];

        const genName = slugify(title);
        parsed.name = name || parsed.name || genName;
        parsed.path = path || parsed.path || parsed.name || genName;

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
                        <div className="formio-form-wrapper limit500">
                            <div className="formio-component form-group lateral mb-2">
                                <label htmlFor="title">Form Title</label>
                                <div ref="element" style={{ width: "100%" }}>
                                    <input
                                        id="title"
                                        name="data[title]"
                                        type="text"
                                        placeholder="Form Title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="formio-component form-group lateral mb-2">
                                <label htmlFor="name">Form Name</label>
                                <div ref="element" style={{ width: "100%" }}>
                                    <input
                                        id="name"
                                        name="data[name]"
                                        type="text"
                                        placeholder="Form Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="formio-component form-group lateral mb-2">
                                <label htmlFor="path">Path</label>
                                <div ref="element" style={{ width: "100%" }}>
                                    <input
                                        id="path"
                                        name="data[path]"
                                        type="text"
                                        placeholder="Path"
                                        value={path}
                                        onChange={(e) => setPath(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="formio-component form-group lateral mb-2">
                                <label htmlFor="display">Display As</label>
                                <div ref="element" style={{ width: "100%" }}>
                                    <select
                                        id="display"
                                        name="data[display]"
                                        value={display}
                                        onChange={(e) => setDisplay(e.target.value)}
                                    >
                                        <option value="form">Form</option>
                                        <option value="wizard">Wizard</option>
                                    </select>
                                </div>
                            </div>
                            <div className="formio-component form-group lateral mb-2">
                                <label htmlFor="tags">Tags</label>
                                <div ref="element" style={{ width: "100%" }}>
                                    <input
                                        id="tags"
                                        name="data[tags]"
                                        type="text"
                                        placeholder="comma,separated"
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="edit-form-header-right">
                        <div className="mb-2">
                            <textarea
                                placeholder="Paste form JSON here..."
                                value={jsonText}
                                onChange={(e) => setJsonText(e.target.value)}
                                style={{ width: "100%", height: "200px" }}
                            />
                            <small>
                                Paste a Form.io JSON including a components array. The
                                metadata above will be applied on save.
                            </small>
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
        </div>
    );
};

export default NewFormJSON;
