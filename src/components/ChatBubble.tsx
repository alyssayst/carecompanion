interface ChatBubbleProps {
  name: string;
  role: string;
  message: string;
  time?: string;
}

const ChatBubble = ({ name, role, message, time }: ChatBubbleProps) => (
  <div className="flex gap-3 py-3">
    <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
      <span className="text-[13px] font-semibold text-primary">{name[0]}</span>
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-baseline gap-2">
        <span className="text-[14px] font-semibold text-foreground">{name}</span>
        <span className="text-[11px] text-muted-foreground">{role}</span>
      </div>
      <p className="text-[14px] text-foreground/80 mt-0.5 leading-relaxed">{message}</p>
      {time && <span className="text-[11px] text-muted-foreground mt-1 block">{time}</span>}
    </div>
  </div>
);

export default ChatBubble;
