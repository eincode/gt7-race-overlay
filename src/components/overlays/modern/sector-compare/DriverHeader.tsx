import { motion } from "motion/react";
import { categoryInfo } from "../../../../lib/utils";
import { sideSlideFromBehindCentre, type SideCustom } from "../animations";
import { sectorStyles as X } from "../styles";

interface Props {
  custom: SideCustom;
  position: number;
  name: string;
  /** GT7 car category (GR3, N300…), shown where the brand logo would go. */
  category: string | undefined;
}

export function DriverHeader({ custom, position, name, category }: Props) {
  const { color, text } = categoryInfo(category ?? "");

  return (
    <div style={{ ...X.headerSlot, gridColumn: custom.side === "left" ? 1 : 3, gridRow: 1 }}>
      <motion.div custom={custom} variants={sideSlideFromBehindCentre} style={X.header}>
        <span style={X.headerPosition}>{position > 0 ? position : "–"}</span>
        <div style={X.headerDivider} />
        {category && <span style={{ ...X.category, background: color, color: text }}>{category}</span>}
        <span style={X.name}>{name}</span>
      </motion.div>
    </div>
  );
}
