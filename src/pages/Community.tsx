import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowLeft, Send, Users, MessageCircle } from "lucide-react";
import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import ChatBubble from "@/components/ChatBubble";

const contacts = [
  { name: "Maria", role: "Mother", detail: "Child age 8 · Harper's Home · Inpatient", mutual: 5 },
  { name: "Daniel", role: "Father", detail: "Child age 5 · Outpatient · Loves walks", mutual: 3 },
  { name: "Sarah", role: "Grandmother", detail: "Child age 3 · Harper's Home · New arrival", mutual: 2 },
  { name: "Rachel", role: "Mother", detail: "Child age 6 · Harper's Home · Support groups", mutual: 4 },
  { name: "Tom", role: "Father", detail: "Child age 12 · Outpatient · Food explorer", mutual: 1 },
  { name: "Emily", role: "Mother", detail: "Child age 9 · Harper's Home · Rideshare", mutual: 6 },
  { name: "Lisa", role: "Mother", detail: "Child age 4 · Outpatient · Wellness", mutual: 3 },
  { name: "Anna", role: "Mother", detail: "Child age 7 · Harper's Home · Inpatient", mutual: 4 },
];

const generalMessages = [
  { name: "Emily", role: "Mother", message: "Is anyone heading to Duke Hospital this afternoon from Harper's Home? I have an appointment at 2 PM.", time: "9:15 AM" },
  { name: "Daniel", role: "Father", message: "I'm going at 1:30! I can take 2 people if anyone needs a ride. Just meet me in the lobby.", time: "9:22 AM" },
  { name: "Maria", role: "Mother", message: "That would be amazing, Daniel! My daughter and I would love a ride. 🙏", time: "9:25 AM" },
  { name: "Sarah", role: "Grandmother", message: "Just arrived yesterday from Raleigh. Would love to meet other families staying here. Anyone free for coffee?", time: "10:05 AM" },
  { name: "Lisa", role: "Mother", message: "Welcome, Sarah! A few of us are heading to the garden at 4 if you want to join. It's a lovely walk.", time: "10:12 AM" },
  { name: "Daniel", role: "Father", message: "We tried Monuts today and it was incredible—kids loved the donuts! Highly recommend for a quick breakfast.", time: "10:31 AM" },
  { name: "Anna", role: "Mother", message: "Tough day today. Treatment didn't go as planned. Grateful for this community though. 💛", time: "2:15 PM" },
  { name: "Maria", role: "Mother", message: "Sending you so much love, Anna. We've been there. It gets better. Here if you need to talk. ❤️", time: "2:18 PM" },
];

const groupChatsData: Record<string, { name: string; role: string; message: string; time: string }[]> = {
  "Harper's Home Residents": [
    { name: "Maria", role: "Mother", message: "Just moved in yesterday — any tips for settling in? Feeling a bit overwhelmed.", time: "8:30 AM" },
    { name: "Rachel", role: "Mother", message: "Welcome Maria! The common kitchen on the 2nd floor is a lifesaver.", time: "8:45 AM" },
    { name: "Daniel", role: "Father", message: "The laundry room can get busy after 5 PM — try to go earlier if you can.", time: "9:02 AM" },
    { name: "Lisa", role: "Mother", message: "If anyone needs extra blankets or pillows, the front desk has spares!", time: "9:18 AM" },
    { name: "Maria", role: "Mother", message: "Thank you all so much 💛 Already feeling more at home.", time: "9:25 AM" },
  ],
  "Outpatient Families": [
    { name: "Tom", role: "Father", message: "Does anyone know the best time to arrive for morning appointments?", time: "7:15 AM" },
    { name: "Emily", role: "Mother", message: "Get there before 8 if you can. The garage on Trent Dr fills up fast.", time: "7:22 AM" },
    { name: "Sarah", role: "Grandmother", message: "We've been taking the Bull City Connector bus — it's free!", time: "7:30 AM" },
    { name: "Tom", role: "Father", message: "Free bus?! That's amazing. Thank you Sarah!", time: "7:35 AM" },
  ],
  "Parents of children age 6–10": [
    { name: "Rachel", role: "Mother", message: "My 7-year-old is getting restless between appointments. Any activity ideas?", time: "10:00 AM" },
    { name: "Emily", role: "Mother", message: "The Museum of Life and Science is great — free day coming up!", time: "10:08 AM" },
    { name: "Daniel", role: "Father", message: "We bring coloring books and a tablet loaded with audiobooks.", time: "10:15 AM" },
  ],
  "Rideshare Coordination": [
    { name: "Daniel", role: "Father", message: "Heading to Target this afternoon around 3 PM. Room for 2 more!", time: "11:00 AM" },
    { name: "Maria", role: "Mother", message: "I'd love a ride! Need to grab some groceries.", time: "11:05 AM" },
    { name: "Daniel", role: "Father", message: "Of course! Meet in the lobby at 2:45.", time: "11:08 AM" },
  ],
  "Meal Planning & Food Tips": [
    { name: "Emily", role: "Mother", message: "Found a great deal at Aldi — bananas, bread, and pasta for under $10!", time: "12:00 PM" },
    { name: "Lisa", role: "Mother", message: "The Ronald McDonald House does free dinners on Tuesdays and Thursdays.", time: "12:15 PM" },
    { name: "Rachel", role: "Mother", message: "We've been meal prepping on Sundays — happy to share our grocery list.", time: "12:25 PM" },
  ],
};

const directMessages = [
  { name: "Maria", lastMessage: "Thank you so much for the ride! 🙏", time: "2:30 PM", unread: 2 },
  { name: "Daniel", lastMessage: "See you in the lobby at 2:45", time: "11:08 AM", unread: 0 },
  { name: "Sarah", lastMessage: "Would love to grab coffee sometime!", time: "10:20 AM", unread: 1 },
  { name: "Rachel", lastMessage: "Sent you the grocery list", time: "Yesterday", unread: 0 },
  { name: "Anna", lastMessage: "Thank you for the kind words ❤️", time: "Yesterday", unread: 0 },
  { name: "Tom", lastMessage: "Let me know about the pharmacy run", time: "Yesterday", unread: 0 },
];

type TopTab = "messages" | "connections";
type ChatView = "list" | "general" | "group" | "dm";
type MsgFilter = "primary" | "groups" | "general";

const Community = () => {
  const navigate = useNavigate();
  const [topTab, setTopTab] = useState<TopTab>("messages");
  const [search, setSearch] = useState("");

  // Messages state
  const [chatView, setChatView] = useState<ChatView>("list");
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [activeDM, setActiveDM] = useState<string | null>(null);
  const [msgFilter, setMsgFilter] = useState<MsgFilter>("primary");

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.role.toLowerCase().includes(search.toLowerCase()) ||
    c.detail.toLowerCase().includes(search.toLowerCase())
  );

  const filteredDMs = directMessages.filter((dm) =>
    dm.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredGroups = Object.keys(groupChatsData).filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  const openGroup = (name: string) => { setActiveGroup(name); setChatView("group"); };
  const openDM = (name: string) => { setActiveDM(name); setChatView("dm"); };
  const goBackToList = () => { setChatView("list"); setActiveGroup(null); setActiveDM(null); };

  // When switching top tabs, reset chat view
  const switchTab = (tab: TopTab) => {
    setTopTab(tab);
    setSearch("");
    goBackToList();
  };

  return (
    <MobileLayout>
      <div className="px-4 pt-14 pb-4">
        {/* Header */}
        <h1 className="text-[28px] font-bold text-foreground tracking-tight mb-4">Community</h1>

        {/* Top-level tabs */}
        {chatView === "list" && (
          <>
            <div className="flex gap-2 mb-4">
              {([
                { key: "messages" as const, label: "Messages", icon: MessageCircle },
                { key: "connections" as const, label: "Connections", icon: Users },
              ]).map((t) => (
                <button
                  key={t.key}
                  onClick={() => switchTab(t.key)}
                  className={`flex-1 h-[40px] rounded-full text-[14px] font-medium transition-all flex items-center justify-center gap-2 ${
                    topTab === t.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <t.icon size={16} />
                  {t.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={topTab === "messages" ? "Search messages..." : "Search contacts..."}
                className="w-full h-[40px] rounded-full bg-muted pl-10 pr-4 text-[14px] text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>
          </>
        )}

        <AnimatePresence mode="wait">
          {/* ===== MESSAGES TAB ===== */}
          {topTab === "messages" && chatView === "list" && (
            <motion.div key="msg-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Sub-filter chips */}
              <div className="flex gap-2 mb-4 overflow-x-auto">
                {([
                  { key: "primary" as const, label: "Primary", count: directMessages.filter(d => d.unread > 0).length },
                  { key: "groups" as const, label: "Groups" },
                  { key: "general" as const, label: "General" },
                ] as { key: MsgFilter; label: string; count?: number }[]).map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setMsgFilter(t.key)}
                    className={`h-[30px] px-3.5 rounded-full text-[12px] font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      msgFilter === t.key
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {t.key === "primary" && t.count! > 0 && <span className="w-2 h-2 rounded-full bg-destructive" />}
                    {t.label}
                  </button>
                ))}
              </div>

              {msgFilter === "primary" && (
                <div className="space-y-1">
                  {filteredDMs.map((dm) => (
                    <motion.div key={dm.name} whileTap={{ scale: 0.98 }} onClick={() => openDM(dm.name)}
                      className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                        <span className="text-[16px] font-semibold text-primary">{dm.name[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-[15px] ${dm.unread > 0 ? "font-bold" : "font-medium"} text-foreground`}>{dm.name}</h4>
                          <span className={`text-[11px] ${dm.unread > 0 ? "text-primary font-medium" : "text-muted-foreground"}`}>{dm.time}</span>
                        </div>
                        <p className={`text-[13px] truncate ${dm.unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>{dm.lastMessage}</p>
                      </div>
                      {dm.unread > 0 && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-primary-foreground">{dm.unread}</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}

              {msgFilter === "groups" && (
                <div className="space-y-1">
                  {filteredGroups.map((name) => {
                    const lastMsg = groupChatsData[name][groupChatsData[name].length - 1];
                    return (
                      <motion.div key={name} whileTap={{ scale: 0.98 }} onClick={() => openGroup(name)}
                        className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-accent/50 flex items-center justify-center shrink-0">
                          <Users size={18} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[15px] font-medium text-foreground truncate">{name}</h4>
                            <span className="text-[11px] text-muted-foreground shrink-0 ml-2">{lastMsg.time}</span>
                          </div>
                          <p className="text-[13px] text-muted-foreground truncate">{lastMsg.name}: {lastMsg.message}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {msgFilter === "general" && (
                <motion.div whileTap={{ scale: 0.98 }} onClick={() => setChatView("general")}
                  className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-accent/50 flex items-center justify-center shrink-0">
                    <MessageCircle size={18} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[15px] font-medium text-foreground">General Chat</h4>
                    <p className="text-[13px] text-muted-foreground truncate">
                      {generalMessages[generalMessages.length - 1].name}: {generalMessages[generalMessages.length - 1].message}
                    </p>
                  </div>
                  <span className="text-[11px] text-muted-foreground">{generalMessages[generalMessages.length - 1].time}</span>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ===== CHAT DETAIL VIEW ===== */}
          {topTab === "messages" && chatView !== "list" && (
            <motion.div key="chat-detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <button onClick={goBackToList} className="flex items-center gap-2 text-primary text-[14px] font-medium mb-4">
                <ArrowLeft size={18} /> Back
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                  {chatView === "dm" ? (
                    <span className="text-[15px] font-semibold text-primary">{activeDM?.[0]}</span>
                  ) : (
                    <Users size={18} className="text-primary" />
                  )}
                </div>
                <h2 className="text-[20px] font-bold text-foreground">
                  {chatView === "general" ? "General Chat" : chatView === "group" ? activeGroup : activeDM}
                </h2>
              </div>

              <div className="divide-y-0">
                {chatView === "general" && generalMessages.map((msg, i) => <ChatBubble key={i} {...msg} />)}
                {chatView === "group" && activeGroup && groupChatsData[activeGroup]?.map((msg, i) => <ChatBubble key={i} {...msg} />)}
                {chatView === "dm" && activeDM && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-3">
                      <span className="text-[24px] font-semibold text-primary">{activeDM[0]}</span>
                    </div>
                    <h3 className="text-[16px] font-semibold text-foreground">{activeDM}</h3>
                    <p className="text-[13px] text-muted-foreground mt-1">Start of your conversation</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-3">
                <input
                  placeholder="Type a message..."
                  className="flex-1 h-[40px] rounded-full bg-card px-4 text-[14px] text-foreground placeholder:text-muted-foreground outline-none"
                  style={{ boxShadow: "0 0 0 1px rgba(0,0,0,.06)" }}
                />
                <motion.button whileTap={{ scale: 0.9 }} className="w-[40px] h-[40px] rounded-full bg-primary flex items-center justify-center">
                  <Send size={16} className="text-primary-foreground" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ===== CONNECTIONS TAB ===== */}
          {topTab === "connections" && (
            <motion.div key="connections" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h3 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wide mb-3">
                Your Connections · {filteredContacts.length}
              </h3>
              <div className="space-y-2">
                {filteredContacts.map((c) => (
                  <motion.div
                    key={c.name}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/user/${c.name.toLowerCase()}`)}
                    className="flex items-center gap-3 p-4 bg-card rounded-2xl cursor-pointer"
                    style={{ boxShadow: "0 4px 12px -2px rgba(0,0,0,0.04)" }}
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                      <span className="text-[16px] font-semibold text-primary">{c.name[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[15px] font-semibold text-foreground">{c.name}</h4>
                      <p className="text-[13px] text-muted-foreground">{c.role} · {c.detail}</p>
                      <p className="text-[11px] text-primary mt-0.5">{c.mutual} mutual connections</p>
                    </div>
                  </motion.div>
                ))}
                {filteredContacts.length === 0 && (
                  <p className="text-center text-[14px] text-muted-foreground py-8">No contacts found</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MobileLayout>
  );
};

export default Community;
