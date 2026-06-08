import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface PlaceCardProps {
  slug: string;
  name: string;
  category: string;
  rating: number;
  distance?: string;
  image?: string;
  priceLevel?: string;
}

const PlaceCard = ({ slug, name, category, rating, distance, image, priceLevel }: PlaceCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/place/${slug}`)}
      className="flex p-4 bg-card rounded-2xl gap-4 cursor-pointer"
      style={{ boxShadow: "0 4px 12px -2px rgba(0,0,0,0.04)" }}
    >
      <div className="w-20 h-20 bg-muted rounded-[12px] shrink-0 overflow-hidden">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-primary/10 flex items-center justify-center">
            <span className="text-muted-foreground text-[13px]">{category[0]}</span>
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center min-w-0">
        <h3 className="text-[16px] font-semibold text-foreground truncate">{name}</h3>
        <p className="text-[13px] text-muted-foreground">
          {category}{priceLevel && ` · ${priceLevel}`}{distance && ` · ${distance}`}
        </p>
        <div className="flex items-center mt-1">
          <Star size={12} fill="hsl(var(--harper-yellow))" color="hsl(var(--harper-yellow))" />
          <span className="text-[13px] font-medium ml-1">{rating}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default PlaceCard;
