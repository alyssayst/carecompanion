import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle, MapPin, Calendar, Users, Heart, Star } from "lucide-react";
import HarperButton from "@/components/HarperButton";

const profiles: Record<string, {
  name: string; role: string; age: string; stayingAt: string; careType: string;
  interests: string[]; connections: number; savedPlaces: number; daysInDurham: number;
  groupChats: string[]; sharedContext: string;
}> = {
  maria: {
    name: "Maria", role: "Mother", age: "Child age 8", stayingAt: "Harper's Home", careType: "Inpatient",
    interests: ["Cooking", "Walking", "Support Groups"],
    connections: 15, savedPlaces: 8, daysInDurham: 34,
    groupChats: ["Harper's Home Residents", "Meal Planning & Food Tips"],
    sharedContext: "Both staying at Harper's Home",
  },
  daniel: {
    name: "Daniel", role: "Father", age: "Child age 5", stayingAt: "Outpatient", careType: "Outpatient",
    interests: ["Hiking", "Board Games", "Ridesharing"],
    connections: 12, savedPlaces: 5, daysInDurham: 21,
    groupChats: ["Rideshare Coordination", "Outpatient Families"],
    sharedContext: "Both in the Rideshare group",
  },
  sarah: {
    name: "Sarah", role: "Grandmother", age: "Child age 3", stayingAt: "Harper's Home", careType: "Inpatient",
    interests: ["Reading", "Coffee", "Gardening"],
    connections: 8, savedPlaces: 3, daysInDurham: 5,
    groupChats: ["Harper's Home Residents"],
    sharedContext: "Both staying at Harper's Home",
  },
  rachel: {
    name: "Rachel", role: "Mother", age: "Child age 6", stayingAt: "Harper's Home", careType: "Inpatient",
    interests: ["Meal Prep", "Yoga", "Support Groups"],
    connections: 18, savedPlaces: 10, daysInDurham: 45,
    groupChats: ["Harper's Home Residents", "Parents of children age 6–10"],
    sharedContext: "Both staying at Harper's Home",
  },
  tom: {
    name: "Tom", role: "Father", age: "Child age 12", stayingAt: "Outpatient", careType: "Outpatient",
    interests: ["Food", "Sports", "Photography"],
    connections: 9, savedPlaces: 12, daysInDurham: 28,
    groupChats: ["Outpatient Families", "Meal Planning & Food Tips"],
    sharedContext: "Both in Meal Planning group",
  },
  emily: {
    name: "Emily", role: "Mother", age: "Child age 9", stayingAt: "Harper's Home", careType: "Inpatient",
    interests: ["Baking", "Ridesharing", "Crafts"],
    connections: 20, savedPlaces: 14, daysInDurham: 60,
    groupChats: ["Harper's Home Residents", "Rideshare Coordination"],
    sharedContext: "Both staying at Harper's Home",
  },
  lisa: {
    name: "Lisa", role: "Mother", age: "Child age 4", stayingAt: "Outpatient", careType: "Outpatient",
    interests: ["Wellness", "Meditation", "Nature Walks"],
    connections: 11, savedPlaces: 6, daysInDurham: 15,
    groupChats: ["Outpatient Families"],
    sharedContext: "Both interested in Wellness",
  },
  anna: {
    name: "Anna", role: "Mother", age: "Child age 7", stayingAt: "Harper's Home", careType: "Inpatient",
    interests: ["Art", "Journaling", "Community Support"],
    connections: 13, savedPlaces: 7, daysInDurham: 40,
    groupChats: ["Harper's Home Residents", "Parents of children age 6–10"],
    sharedContext: "Both staying at Harper's Home",
  },
};

const fallback = profiles.maria;

const OtherUserProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const profile = profiles[id || ""] || fallback;

  return (
    <div className="mobile-container bg-background min-h-screen">
      <div className="px-4 pt-14 pb-8">
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft size={24} className="text-foreground" />
        </motion.button>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center mb-3">
            <span className="text-[28px] font-bold text-primary">{profile.name[0]}</span>
          </div>
          <h2 className="text-[24px] font-semibold text-foreground">{profile.name}</h2>
          <p className="text-[15px] text-muted-foreground mt-1">{profile.role}</p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
            <span className="text-[13px] text-muted-foreground bg-muted px-3 py-1 rounded-full">{profile.age}</span>
            <span className="text-[13px] text-muted-foreground bg-muted px-3 py-1 rounded-full">{profile.stayingAt}</span>
            <span className="text-[13px] text-muted-foreground bg-muted px-3 py-1 rounded-full">{profile.careType}</span>
          </div>
        </div>

        {/* Shared context */}
        <div className="bg-primary/5 rounded-2xl p-4 mb-6">
          <p className="text-[14px] text-primary font-medium text-center">{profile.sharedContext}</p>
        </div>

        {/* Stats */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 bg-card rounded-2xl p-4 text-center" style={{ boxShadow: "0 0 0 1px rgba(0,0,0,.04)" }}>
            <Users size={16} className="text-primary mx-auto mb-1" />
            <p className="text-[20px] font-bold text-foreground">{profile.connections}</p>
            <p className="text-[11px] text-muted-foreground">Connections</p>
          </div>
          <div className="flex-1 bg-card rounded-2xl p-4 text-center" style={{ boxShadow: "0 0 0 1px rgba(0,0,0,.04)" }}>
            <Star size={16} className="text-primary mx-auto mb-1" />
            <p className="text-[20px] font-bold text-foreground">{profile.savedPlaces}</p>
            <p className="text-[11px] text-muted-foreground">Saved Places</p>
          </div>
          <div className="flex-1 bg-card rounded-2xl p-4 text-center" style={{ boxShadow: "0 0 0 1px rgba(0,0,0,.04)" }}>
            <Calendar size={16} className="text-primary mx-auto mb-1" />
            <p className="text-[20px] font-bold text-foreground">{profile.daysInDurham}</p>
            <p className="text-[11px] text-muted-foreground">Days Here</p>
          </div>
        </div>

        {/* Interests */}
        <div className="mb-6">
          <h3 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wide mb-3">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest) => (
              <span key={interest} className="text-[13px] text-foreground bg-accent/50 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Heart size={12} className="text-primary" />
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* Groups in common */}
        <div className="mb-8">
          <h3 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wide mb-3">Groups in Common</h3>
          <div className="space-y-2">
            {profile.groupChats.map((group) => (
              <div key={group} className="flex items-center gap-3 p-3 bg-card rounded-xl" style={{ boxShadow: "0 0 0 1px rgba(0,0,0,.04)" }}>
                <div className="w-8 h-8 rounded-full bg-accent/50 flex items-center justify-center">
                  <Users size={14} className="text-primary" />
                </div>
                <span className="text-[14px] font-medium text-foreground">{group}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Message button */}
        <HarperButton onClick={() => navigate("/messages")}>
          <MessageCircle size={18} className="mr-2" />
          Message {profile.name}
        </HarperButton>
      </div>
    </div>
  );
};

export default OtherUserProfile;
