import React, { useState, useEffect } from 'react';
import { X, Users, Share2, MessageCircle, Send, User, Clock, CheckCircle } from './Icons';
import getApiUrl, { getAuthHeaders } from '../services/apiConfig';
import { useAppContext } from '../hooks/useAppContext';
import LockedFeatureGate from './LockedFeatureGate';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: 'online' | 'offline' | 'busy';
  lastSeen?: string;
}

interface SharedQuery {
  id: string;
  query: string;
  sharedBy: string;
  timestamp: string;
  comments: number;
}

interface CollaborationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const MOCK_TEAM: TeamMember[] = [
  { id: '1', name: 'Dr. Sarah Chen', email: 'sarah@pharma.com', avatar: 'SC', status: 'online' },
  { id: '2', name: 'Michael Torres', email: 'michael@pharma.com', avatar: 'MT', status: 'online' },
  { id: '3', name: 'Dr. Emily Watson', email: 'emily@pharma.com', avatar: 'EW', status: 'busy' },
  { id: '4', name: 'James Park', email: 'james@pharma.com', avatar: 'JP', status: 'offline', lastSeen: '2 hours ago' },
];

export default function CollaborationPanel({ isOpen, onClose }: CollaborationPanelProps) {
  const { user } = useAppContext();
  const [activeTab, setActiveTab] = useState<'team' | 'shared' | 'chat'>('team');
  const [shareEmail, setShareEmail] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [sharedQueries, setSharedQueries] = useState<SharedQuery[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!isOpen || !user) return;
    
    // Load members
    fetch(`${getApiUrl()}/api/collaboration/members`, {
      headers: getAuthHeaders()
    })
      .then(res => res.json())
      .then(data => setTeamMembers(data))
      .catch(err => console.error('Error fetching members:', err));

    // Load shared queries
    fetch(`${getApiUrl()}/api/collaboration/shared`, {
      headers: getAuthHeaders()
    })
      .then(res => res.json())
      .then(data => setSharedQueries(data))
      .catch(err => console.error('Error fetching shared queries:', err));

    // Load chat messages
    fetch(`${getApiUrl()}/api/collaboration/chat`, {
      headers: getAuthHeaders()
    })
      .then(res => res.json())
      .then(data => setChatMessages(data))
      .catch(err => console.error('Error fetching chat:', err));
  }, [isOpen, user]);

  const handleShare = () => {
    if (!shareEmail) return;
    alert(`Invitation sent to ${shareEmail}`);
    setShareEmail('');
  };

  const handleSendChat = () => {
    if (!chatMessage.trim()) return;
    
    fetch(`${getApiUrl()}/api/collaboration/chat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ content: chatMessage.trim() })
    })
      .then(res => res.json())
      .then(newMsg => {
        setChatMessages(prev => [...prev, newMsg]);
        setChatMessage('');
      })
      .catch(err => console.error('Error sending chat message:', err));
  };

  const teamMembersList = teamMembers.length > 0 ? teamMembers : MOCK_TEAM;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[80vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Team Collaboration</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Share research and collaborate in real-time</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        {/* Body — gated or authenticated content */}
        {!user ? (
          <div className="flex-1 overflow-auto p-8 flex items-center justify-center">
            <LockedFeatureGate featureName="Team Collaboration Panel" />
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
              {[
                { id: 'team', label: 'Team', icon: Users },
                { id: 'shared', label: 'Shared Queries', icon: Share2 },
                { id: 'chat', label: 'Chat', icon: MessageCircle }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-auto p-6">
              {activeTab === 'team' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Invite Team Members</h3>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={shareEmail}
                        onChange={(e) => setShareEmail(e.target.value)}
                        placeholder="Enter email address"
                        className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleShare}
                        className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors"
                      >
                        Invite
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Team Members ({teamMembersList.length})</h3>
                    <div className="space-y-2">
                      {teamMembersList.map(member => (
                        <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-medium">
                                {member.avatar}
                              </div>
                              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 ${
                                member.status === 'online' ? 'bg-green-500' :
                                member.status === 'busy' ? 'bg-orange-500' : 'bg-slate-400'
                              }`}></div>
                            </div>
                            <div>
                              <p className="font-medium text-slate-800 dark:text-white">{member.name}</p>
                              <p className="text-xs text-slate-500">{member.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {member.status === 'offline' && member.lastSeen && (
                              <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {member.lastSeen}
                              </span>
                            )}
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              member.status === 'online' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              member.status === 'busy' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                              'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                            }`}>
                              {member.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'shared' && (
                <div className="space-y-4">
                  {sharedQueries.length === 0 ? (
                    <div className="text-center py-12">
                      <Share2 className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                      <p className="text-slate-500 dark:text-slate-400">No shared queries yet</p>
                      <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Run queries and share them with your team</p>
                    </div>
                  ) : (
                    sharedQueries.map(query => (
                      <div key={query.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <p className="font-medium text-slate-800 dark:text-white">{query.query}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {query.sharedBy}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {query.timestamp}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {query.comments} comments
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'chat' && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 space-y-4 mb-4 min-h-[300px] max-h-[350px] overflow-y-auto pr-1">
                    {chatMessages.length === 0 ? (
                      <p className="text-center text-slate-400 py-8 text-sm">No messages yet. Send a message to start collaboration!</p>
                    ) : (
                      chatMessages.map(msg => (
                        <div key={msg.id} className={`flex gap-3 ${msg.userEmail === 'guest@curecoders.com' ? 'justify-end' : ''}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                            msg.userEmail === 'guest@curecoders.com' ? 'bg-cyan-500 order-last' : 'bg-indigo-500'
                          }`}>
                            {msg.userName ? msg.userName.slice(0, 2).toUpperCase() : 'AN'}
                          </div>
                          <div className={`rounded-lg px-4 py-2 max-w-[80%] ${
                            msg.userEmail === 'guest@curecoders.com' ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-800'
                          }`}>
                            <p className={`text-[10px] font-bold mb-0.5 ${
                              msg.userEmail === 'guest@curecoders.com' ? 'text-indigo-200' : 'text-slate-500'
                            }`}>{msg.userName}</p>
                            <p className="text-sm">{msg.content}</p>
                            <p className={`text-[9px] mt-1 ${
                              msg.userEmail === 'guest@curecoders.com' ? 'text-indigo-300' : 'text-slate-400'
                            }`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                    />
                    <button
                      onClick={handleSendChat}
                      className="p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
