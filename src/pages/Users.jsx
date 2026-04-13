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

    if (loading)
        return (
            <div className="flex items-center gap-3 text-ui-accent font-mono animate-pulse">
                <Loading/>
            </div>
        );

    return (
        <div className="space-y-6   ">
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}

            {/* Header Control Section */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div className="flex sm:flex-wrap gap-2 p-1.5  bg-white/[0.03] rounded-2xl border border-white/5 backdrop-blur-md">
                    {["ALL", "ADMIN", "TEACHER", "STUDENT"].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-2 overflow-auto sm:px-5 py-2 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all ${
                                filter === cat
                                    ? "bg-ui-accent "
                                    : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3 w-full xl:w-auto">
                    <div className="relative flex-grow">
                        <Search
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                            size={16}
                        />
                        <input
                            type="text"
                            placeholder="Filter by id..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full xl:w-64 bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-xs font-mono focus:border-ui-accent outline-none transition-all placeholder:text-gray-600"
                        />
                    </div>

                    <button
                        onClick={toggleSort}
                        className="flex min-w-[80px] items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-mono uppercase tracking-widest text-ui-highlight hover:border-ui-highlight transition-all"
                    >
                        <ArrowUpDown size={14} />
                        {sortDirection === "asc" ? "A-Z" : "Z-A"}
                    </button>
                </div>
            </div>

            {/* Main Registry Table */}
            <div className="overflow-scroll rounded-2xl border border-white/5 shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                            <th className="p-5 text-[10px] uppercase tracking-[0.2em] text-gray-500 font-mono">
                                User ID
                            </th>
                            <th className="p-5 text-[10px] uppercase tracking-[0.2em] text-gray-500 font-mono">
                                Role
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {processedUsers.length > 0 ? (
                            processedUsers.map((user) => (
                                <tr
                                    key={user.id}
                                    className="hover:bg-ui-accent/[0.02] transition-colors group"
                                >
                                    <td className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ui-accent/20 to-transparent border border-ui-accent/20 flex items-center justify-center text-ui-accent shadow-inner">
                                                <UserIcon size={18} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-200 group-hover:text-white transition-colors">
                                                    {user.username}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[9px] font-mono font-bold border ${
                                                user.role === "ADMIN"
                                                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                                                    : user.role === "TEACHER"
                                                      ? "bg-ui-accent/10 text-ui-accent border-ui-accent/20"
                                                      : "bg-blue-500/10 text-blue-400 border-blue-500/20"
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
                                    className="p-20 text-center font-mono text-gray-600 animate-pulse"
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
