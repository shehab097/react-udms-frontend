import React, { useState, useEffect } from "react";
import { getToken } from "../services/tokenService";
import { ADMIN_ENDPOINT } from "../config/config";

const Admin = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [sortConfig, setSortConfig] = useState({
        key: "name",
        direction: "asc",
    });

    useEffect(() => {
        const fetchAdmins = async () => {
            const token = getToken();
            try {
                const response = await fetch(ADMIN_ENDPOINT, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setAdmins(Array.isArray(data) ? data : []);
                } else if (response.status === 403) {
                    setError(
                        "ACCESS_DENIED: Only administrators can view this directory.",
                    );
                } else {
                    setError(`SYSTEM_ERROR: Status ${response.status}`);
                }
            } catch (err) {
                console.log(err)
                setError("CONNECTION_FAILURE: Admin service offline.");
            } finally {
                setLoading(false);
            }
        };
        fetchAdmins();
    }, []);

    const filteredAdmins = admins.filter((a) => {
        const search = searchTerm.toLowerCase();
        return (
            (a.name?.toLowerCase().includes(search) ?? false) ||
            (a.username?.toLowerCase().includes(search) ?? false) ||
            (a.email?.toLowerCase().includes(search) ?? false)
        );
    });

    const sortedAdmins = [...filteredAdmins].sort((a, b) => {
        let valA = a[sortConfig.key] ?? "";
        let valB = b[sortConfig.key] ?? "";
        if (sortConfig.key === "userId")
            return sortConfig.direction === "asc" ? valA - valB : valB - valA;
        valA = valA.toString().toLowerCase();
        valB = valB.toString().toLowerCase();
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
    });

    const handleSortChange = (e) => {
        const [key, direction] = e.target.value.split("-");
        setSortConfig({ key, direction });
    };

    if (loading)
        return (
            <div className="p-10 text-ui-accent font-mono text-sm animate-pulse">
                AUTHORIZING_ACCESS...
            </div>
        );
    if (error)
        return (
            <div className="p-10 text-ui-secondary font-mono text-xs italic">
                &gt; {error}
            </div>
        );

    return (
        <div className="w-full space-y-5 animate-in fade-in duration-500 overflow-hidden">
            {/* Control Bar */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <div className="w-full md:w-64">
                        <label className="block text-[11px] font-mono text-ui-highlight uppercase tracking-widest mb-1.5 ml-1">
                            Admin_Search
                        </label>
                        <input
                            type="text"
                            placeholder="Search admins..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-ui-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ui-accent transition-all text-content-primary"
                        />
                    </div>

                    <div className="w-full md:w-48">
                        <label className="block text-[11px] font-mono text-ui-highlight uppercase tracking-widest mb-1.5 ml-1">
                            Sort_Order
                        </label>
                        <select
                            onChange={handleSortChange}
                            className="w-full bg-ui-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ui-accent text-content-primary cursor-pointer"
                        >
                            <option value="name-asc">Name (A-Z)</option>
                            <option value="username-asc">Username</option>
                            <option value="userId-asc">System ID</option>
                        </select>
                    </div>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-[10px] font-mono text-content-secondary uppercase tracking-widest">
                        Security_Privilege
                    </p>
                    <p className="text-sm font-bold text-ui-accent">
                        LEVEL_ADMIN
                    </p>
                </div>
            </div>

            {/* Admin Table */}
            <div className="w-full overflow-x-auto rounded-xl border border-white/5 bg-ui-surface/20 shadow-xl custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/5">
                            <th className="p-4 text-[11px] uppercase tracking-widest text-ui-highlight font-bold w-48">
                                Administrator
                            </th>
                            <th className="p-4 text-[11px] uppercase tracking-widest text-ui-highlight font-bold">
                                Email
                            </th>
                            <th className="p-4 text-[11px] uppercase tracking-widest text-ui-highlight font-bold w-40">
                                Contact
                            </th>
                            <th className="p-4 text-[11px] uppercase tracking-widest text-ui-highlight font-bold w-28">
                                Gender
                            </th>
                            <th className="p-4 text-[11px] uppercase tracking-widest text-ui-highlight font-bold">
                                Location
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {sortedAdmins.map((a) => (
                            <tr
                                key={a.id}
                                className="hover:bg-white/[0.02] transition-colors"
                            >
                                {/* Profile */}
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-ui-accent/10 border border-ui-accent/20 flex items-center justify-center font-bold text-ui-accent text-xs shadow-inner">
                                            {a.name
                                                ? a.name.charAt(0).toUpperCase()
                                                : a.username
                                                      .charAt(0)
                                                      .toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-content-primary">
                                                {a.name || "System Admin"}
                                            </div>
                                            <div className="text-[10px] font-mono text-ui-highlight/60 uppercase">
                                                @{a.username}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* Email */}
                                <td
                                    className={`p-4 ${a.email ? "text-content-primary" : "text-content-secondary/30 italic text-xs"}`}
                                >
                                    {a.email || "no_email_listed"}
                                </td>

                                {/* Phone */}
                                <td className="p-4 font-mono text-content-secondary text-[13px]">
                                    {a.phone || "---"}
                                </td>

                                {/* Gender */}
                                <td className="p-4">
                                    <span
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-tight ${
                                            a.gender === "MALE"
                                                ? "border-blue-500/20 bg-blue-500/5 text-blue-400"
                                                : a.gender === "FEMALE"
                                                  ? "border-pink-500/20 bg-pink-500/5 text-pink-400"
                                                  : "border-white/10 text-content-secondary/40"
                                        }`}
                                    >
                                        {a.gender || "U"}
                                    </span>
                                </td>

                                {/* Address */}
                                <td className="p-4">
                                    <div
                                        className="max-w-[220px] truncate text-content-secondary text-[13px]"
                                        title={a.address}
                                    >
                                        {a.address || "---"}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Admin;
