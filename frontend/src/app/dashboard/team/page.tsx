"use client";

import { useState, useEffect } from 'react';
import { Plus, Search, MoreHorizontal, Mail, Shield, User, Clock, CheckCircle2 } from "lucide-react";

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Agent';
  status: 'Active' | 'Pending';
  lastActive: string;
  avatar?: string;
};

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/team`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          setMembers(data);
        }
      } catch (error) {
        console.error('Failed to fetch team members:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTeam();
  }, []);

  const filteredMembers = members.filter(m => 
    m.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Team Settings</h1>
          <p className="text-sm text-neutral-400 max-w-xl">
            Kelola anggota tim Anda, atur peran dan hak akses, serta pantau aktivitas agen *customer service* Anda.
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)]">
          <Plus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      {/* Stats/Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-neutral-900/40 border border-neutral-800/60 rounded-2xl p-5 flex items-center gap-4 backdrop-blur-sm">
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <User className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-400">Total Members</p>
            <p className="text-2xl font-bold text-white">{members.length} <span className="text-xs font-normal text-neutral-500">/ 10 seats</span></p>
          </div>
        </div>
        <div className="bg-neutral-900/40 border border-neutral-800/60 rounded-2xl p-5 flex items-center gap-4 backdrop-blur-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-400">Active Agents</p>
            <p className="text-2xl font-bold text-white">{members.filter(m => m.status === 'Active').length}</p>
          </div>
        </div>
        <div className="bg-neutral-900/40 border border-neutral-800/60 rounded-2xl p-5 flex items-center gap-4 backdrop-blur-sm">
          <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
            <Clock className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-400">Pending Invites</p>
            <p className="text-2xl font-bold text-white">{members.filter(m => m.status === 'Pending').length}</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-[#0F0F11]/80 backdrop-blur-xl border border-white/[0.05] rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Decorative ambient glow inside the box */}
        <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Toolbar */}
        <div className="p-6 border-b border-white/[0.05] flex flex-col sm:flex-row justify-between items-center gap-4 relative z-10">
          <div className="relative w-full sm:w-[320px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input 
              type="text" 
              placeholder="Cari nama atau email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-neutral-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-neutral-600"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button className="px-4 py-2.5 bg-black/40 border border-neutral-800 hover:border-neutral-700 rounded-xl text-sm font-medium text-neutral-300 transition-colors w-full sm:w-auto">
              Filter Role
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.05] text-[11px] font-bold text-neutral-500 uppercase tracking-widest bg-black/20">
                <th className="px-6 py-4">Member</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Active</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {member.avatar ? (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300 text-xs">
                          {member.avatar}
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-500">
                          <Mail className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-white mb-0.5">{member.name}</p>
                        <p className="text-xs text-neutral-500">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {member.role === 'Owner' && <Shield className="w-3.5 h-3.5 text-orange-400" />}
                      <span className={`text-xs font-semibold ${
                        member.role === 'Owner' ? 'text-orange-400' :
                        member.role === 'Admin' ? 'text-indigo-400' :
                        'text-neutral-300'
                      }`}>
                        {member.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      member.status === 'Active' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-400">
                    {member.lastActive}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 rounded-lg hover:bg-white/10 text-neutral-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-neutral-500 text-sm">
                    Tidak ada anggota tim yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
