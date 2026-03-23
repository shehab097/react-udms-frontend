import React, { useState, useEffect } from "react";
import { getToken } from "../services/tokenService";

const Users = () => {
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Default sorting by username ascending
    const [sortDirection, setSortDirection] = useState("asc");

    useEffect(() => {
        const fetchUsers = async () => {
            const token = getToken();
            try {
                const response = await fetch("http://localhost:8080/users", {
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
                    setError("ACCESS_DENIED: High clearance required.");
                } else {
                    setError(
                        `ERROR: ${response.status} - Unable to fetch records.`,
                    );
                }
            } catch (err) {
                setError("CONNECTION_FAILURE: Backend unreachable.");
                console.log(err)
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    // 1. Filter Logic
    const filteredUsers =
        filter === "ALL"
            ? [...users]
            : users.filter((user) => user.role === filter);

    // 2. Sort Logic (By Username Only)
    const sortedUsers = [...filteredUsers].sort((a, b) => {
        const nameA = a.username.toLowerCase();
        const nameB = b.username.toLowerCase();

        if (sortDirection === "asc") {
            return nameA.localeCompare(nameB);
        } else {
            return nameB.localeCompare(nameA);
        }
    });

    const toggleSort = () => {
        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    };

    if (loading)
        return (
            <div className="flex items-center gap-3 text-ui-accent font-mono p-10">
                <div className="w-2 h-2 bg-ui-accent animate-ping rounded-full" />
                L0ADING_DATABASE...
            </div>
        );

    if (error)
        return (
            <div className="p-10 bg-ui-secondary/10 border border-ui-secondary/20 rounded-2xl text-ui-secondary font-mono text-sm">
                &gt; {error}
            </div>
        );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Control Bar: Filters + Sort Toggle */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-wrap gap-2 p-1 bg-ui-background/50 rounded-2xl border border-white/5">
                    {["ALL", "ADMIN", "TEACHER", "STUDENT"].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                                filter === cat
                                    ? "bg-ui-accent text-white shadow-lg"
                                    : "text-content-secondary hover:text-white"
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <button
                    onClick={toggleSort}
                    className="flex items-center gap-2 px-4 py-2 bg-ui-surface border border-white/10 rounded-xl text-xs font-bold text-ui-highlight hover:border-ui-highlight transition-all"
                >
                    <span>Sort by Name</span>
                    <span className="text-lg">
                        {sortDirection === "asc" ? "↓" : "↑"}
                    </span>
                </button>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto rounded-2xl border border-white/5 bg-ui-surface/20 shadow-inner">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/5">
                            <th
                                onClick={toggleSort}
                                className="p-5 text-[10px] uppercase tracking-widest text-ui-highlight font-bold cursor-pointer hover:text-white transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    Username{" "}
                                    {sortDirection === "asc"
                                        ? " (A-Z)"
                                        : " (Z-A)"}
                                </div>
                            </th>
                            <th className="p-5 text-[10px] uppercase tracking-widest text-ui-highlight font-bold">
                                Role
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {sortedUsers.length > 0 ? (
                            sortedUsers.map((user) => (
                                <tr
                                    key={user.id}
                                    className="hover:bg-white/5 transition-colors group"
                                >
                                    <td className="p-5 font-bold text-content-primary">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-ui-accent/10 border border-ui-accent/20 flex items-center justify-center text-ui-accent text-xs">
                                                {user.username
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                            {user.username}
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span
                                            className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                                                user.role === "ADMIN"
                                                    ? "bg-ui-secondary/20 text-ui-secondary border-ui-secondary/30"
                                                    : user.role === "TEACHER"
                                                      ? "bg-ui-accent/20 text-ui-accent border-ui-accent/30"
                                                      : "bg-ui-highlight/20 text-ui-highlight border-ui-highlight/30"
                                            }`}
                                        >
                                            {user.role}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="2"
                                    className="p-16 text-center text-content-secondary italic text-sm"
                                >
                                    No records found in the "{filter}" sector.
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
