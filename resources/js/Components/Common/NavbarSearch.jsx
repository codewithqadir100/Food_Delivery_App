import { useEffect, useRef, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { Clock, Search, TrendingUp, X } from "lucide-react";
import TextInput from "@/Components/Forms/TextInput";

const HISTORY_KEY = "foodhub-search-history";
const HISTORY_LIMIT = 5;

function readHistory() {
    try {
        const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");

        return Array.isArray(saved) ? saved.filter((item) => typeof item === "string") : [];
    } catch {
        return [];
    }
}

function writeHistory(items) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, HISTORY_LIMIT)));
}

export default function NavbarSearch({ categories = [] }) {
    const page = usePage();
    const rootRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const current = new URLSearchParams(page.url.split("?")[1] || "").get("q") || "";
        setQuery(current);
    }, [page.url]);

    useEffect(() => {
        setHistory(readHistory());
    }, [open]);

    useEffect(() => {
        if (!open) {
            return undefined;
        }

        const onPointer = (event) => {
            if (!rootRef.current?.contains(event.target)) {
                setOpen(false);
            }
        };
        const onKey = (event) => {
            if (event.key === "Escape") {
                setOpen(false);
            }
        };

        document.addEventListener("pointerdown", onPointer);
        document.addEventListener("keydown", onKey);

        return () => {
            document.removeEventListener("pointerdown", onPointer);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    const remember = (term) => {
        const next = [term, ...readHistory().filter((item) => item.toLowerCase() !== term.toLowerCase())];
        writeHistory(next);
        setHistory(next.slice(0, HISTORY_LIMIT));
    };

    const goToSearch = (term) => {
        const value = term.trim();

        if (!value) {
            return;
        }

        remember(value);
        setQuery(value);
        setOpen(false);
        router.get("/restaurants", { q: value });
    };

    const goToCategory = (category) => {
        setOpen(false);
        router.get("/restaurants", { category: category.slug });
    };

    const removeHistory = (term) => {
        const next = readHistory().filter((item) => item !== term);
        writeHistory(next);
        setHistory(next);
    };

    const term = query.trim().toLowerCase();
    const matches = term
        ? categories.filter((category) => category.name.toLowerCase().includes(term)).slice(0, 4)
        : [];
    const popular = categories.slice(0, 6);

    return (
        <form
            ref={rootRef}
            onSubmit={(event) => {
                event.preventDefault();
                goToSearch(query);
            }}
            className={`nav-search relative ${open ? "is-open" : ""}`}
            onPointerDown={() => setOpen(true)}
        >
            <TextInput
                type="text"
                placeholder="Search restaurants..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setOpen(true)}
                icon={<Search size={16} />}
                className="!rounded-full !border-[color:var(--color-border-light)] !bg-[color:var(--color-bg-secondary)] !py-2 !text-sm !shadow-none focus:!ring-offset-0"
            />

            {open && (
                <div className="nav-search-panel">
                    {term && (
                        <button type="submit" className="nav-search-row">
                            <Search size={16} />
                            <span>
                                Search for <strong>{query.trim()}</strong>
                            </span>
                        </button>
                    )}

                    {matches.length > 0 && (
                        <div className="nav-search-section">
                            {matches.map((category) => (
                                <button
                                    key={category.id}
                                    type="button"
                                    className="nav-search-row"
                                    onClick={() => goToCategory(category)}
                                >
                                    <TrendingUp size={16} />
                                    <span>{category.name}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {history.length > 0 && (
                        <div className="nav-search-section">
                            <div className="nav-search-label">
                                <span>Recent</span>
                                <button
                                    type="button"
                                    className="nav-search-clear"
                                    onClick={() => {
                                        writeHistory([]);
                                        setHistory([]);
                                    }}
                                >
                                    Clear
                                </button>
                            </div>
                            {history.map((item) => (
                                <div key={item} className="nav-search-history">
                                    <button
                                        type="button"
                                        className="nav-search-row"
                                        onClick={() => goToSearch(item)}
                                    >
                                        <Clock size={16} />
                                        <span>{item}</span>
                                    </button>
                                    <button
                                        type="button"
                                        className="nav-search-remove"
                                        aria-label={`Remove ${item}`}
                                        onClick={() => removeHistory(item)}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {!term && popular.length > 0 && (
                        <div className="nav-search-section">
                            <p className="nav-search-label">Popular right now</p>
                            <div className="nav-search-pills">
                                {popular.map((category) => (
                                    <button
                                        key={category.id}
                                        type="button"
                                        className="nav-search-pill"
                                        onClick={() => goToCategory(category)}
                                    >
                                        {category.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </form>
    );
}
