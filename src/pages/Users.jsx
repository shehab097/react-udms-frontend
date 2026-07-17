import React, { useState, useEffect, useMemo } from "react";
import {
    Search,
    ArrowUpDown,
    ShieldAlert,
    User as UserIcon,
} from "lucide-react";
import { getToken } from "../services/tokenService";
import Toast from "../components/Toast";
import Loading from "../components/Loading";

import { USERS_ENDPOINT } from "../config/config";
import { data } from "autoprefixer";

const Users = () => {
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [sortDirection, setSortDirection] = useState("asc");

    useEffect(() => {
        const fetchUsers = async () => {
            const token = getToken();
            try {
                const response = await fetch(`${USERS_ENDPOINT}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUsers(data);
                } else if (response.status === 403) {
                    setToast({
                        message: "ACCESS_DENIED: High clearance required.",
                        type: "error",
                    });
                } else {
                    setToast({
                        message: `FETCH_ERROR: status ${response.status}`,
                        type: "error",
                    });
                }
            } catch (err) {
                setToast({
                    message: "CONNECTION_FAILURE: Backend unreachable.",
                    type: "error",
                });
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    // Optimized filtering and searching
    const processedUsers = useMemo(() => {
        let result =
            filter === "ALL"
                ? [...users]
                : users.filter((u) => u.role === filter);

        if (searchQuery) {
            result = result.filter((u) =>
                u.username.toLowerCase().includes(searchQuery.toLowerCase()),
            );
        }

        return result.sort((a, b) => {
            const nameA = a.username.toLowerCase();
            const nameB = b.username.toLowerCase();
            return sortDirection === "asc"
                ? nameA.localeCompare(nameB)
                : nameB.localeCompare(nameA);
        });
    }, [users, filter, searchQuery, sortDirection]);

    const toggleSort = () =>
        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));

    // Calculate user counts by role
    const roleCounts = useMemo(() => {
        const counts = {
            ALL: users.length,
            ADMIN: users.filter((u) => u.role === "ADMIN").length,
            TEACHER: users.filter((u) => u.role === "TEACHER").length,
            STUDENT: users.filter((u) => u.role === "STUDENT").length,
        };
        return counts;
    }, [users]);

    if (loading)
        return (
            <div className="flex items-center gap-3 text-ui-accent font-mono animate-pulse">
                <Loading />
            </div>
        );

    return (
        <div className="space-y-6   ">
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}

            {/* Header Control Section */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div className="flex sm:flex-wrap gap-2 p-1.5 bg-ui-surface/[0.03] rounded-2xl border border-ui-neutral/20 backdrop-blur-md">
                    {["ALL", "ADMIN", "TEACHER", "STUDENT"].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-2 overflow-auto sm:px-5 py-2 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all flex items-center gap-2 ${
                                filter === cat
                                    ? "bg-ui-accent text-ui-surface"
                                    : "text-content-muted hover:text-content-secondary hover:bg-ui-accent/10"
                            }`}
                        >
                            <span>{cat}</span>
                            <span className="text-[8px] opacity-70">
                                ({roleCounts[cat]})
                            </span>
                        </button>
                    ))}

                    <div>{/* {} */}</div>
                </div>
                <div className="flex items-center gap-3 w-full xl:w-auto">
                    <div className="relative flex-grow">
                        <Search
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-content-muted"
                            size={16}
                        />
                        <input
                            type="text"
                            placeholder="Filter by id..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full xl:w-64 bg-ui-surface/10 border border-ui-neutral/20 rounded-xl py-2.5 pl-11 pr-4 text-xs font-mono text-content-primary focus:border-ui-accent focus:ring-1 focus:ring-ui-accent outline-none transition-all placeholder:text-content-muted"
                        />
                    </div>

                    <button
                        onClick={toggleSort}
                        className="flex min-w-[80px] items-center gap-2 px-4 py-2.5 bg-ui-surface/5 border border-ui-neutral/20 rounded-xl text-[10px] font-mono uppercase tracking-widest text-ui-highlight hover:border-ui-highlight transition-all"
                    >
                        <ArrowUpDown size={14} />
                        {sortDirection === "asc" ? "A-Z" : "Z-A"}
                    </button>
                </div>
            </div>

            {/* User Count Summary */}
            <div className="flex items-center gap-4 p-4 bg-ui-surface/[0.02] rounded-xl border border-ui-neutral/20">
                <span className="text-xs font-mono text-content-muted">
                    TOTAL_USERS:{" "}
                    <span className="text-ui-accent font-bold">
                        {roleCounts.ALL}
                    </span>
                </span>
                <span className="text-xs font-mono text-content-muted">
                    DISPLAYED:{" "}
                    <span className="text-ui-highlight font-bold">
                        {processedUsers.length}
                    </span>
                </span>
            </div>

            {/* Main Registry Table */}
            <div className="overflow-scroll rounded-2xl border border-ui-neutral/20 shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-ui-neutral/20 bg-ui-surface/[0.02]">
                            <th className="p-5 text-[10px] uppercase tracking-[0.2em] text-content-muted font-mono">
                                User ID
                            </th>
                            <th className="p-5 text-[10px] uppercase tracking-[0.2em] text-content-muted font-mono">
                                Role
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-ui-neutral/20">
                        {processedUsers.length > 0 ? (
                            processedUsers.map((user) => (
                                <tr
                                    key={user.id}
                                    className="hover:bg-ui-accent/[0.05] transition-colors group"
                                >
                                    <td className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ui-accent/20 to-transparent border border-ui-accent/20 flex items-center justify-center text-ui-accent shadow-inner">
                                                <UserIcon size={18} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-content-secondary group-hover:text-content-primary transition-colors">
                                                    {user.username}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[9px] font-mono font-bold border ${
                                                user.role === "ADMIN"
                                                    ? "bg-ui-secondary/10 text-ui-secondary border-ui-secondary/20"
                                                    : user.role === "TEACHER"
                                                      ? "bg-ui-accent/10 text-ui-accent border-ui-accent/20"
                                                      : "bg-ui-highlight/10 text-ui-highlight border-ui-highlight/20"
                                            }`}
                                        >
                                            {user.role === "ADMIN" && (
                                                <ShieldAlert size={10} />
                                            )}
                                            {user.role}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="2"
                                    className="p-20 text-center font-mono text-content-secondary animate-pulse"
                                >
                                    &gt; NO_RECORDS_MATCH_CRITERIA
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Users;
