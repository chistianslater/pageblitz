/**
 * Industry-specific icon component
 * Automatically renders the right icon based on business category
 */
import {
  Scissors,
  Sparkles,
  Heart,
  Crown,
  Palette,
  Droplet,
  Sun,
  Star,
  Leaf,
  Wind,
  Gem,
  Utensils,
  ChefHat,
  Flame,
  Wine,
  GlassWater,
  Coffee,
  Croissant,
  Cookie,
  Pizza,
  Music,
  Moon,
  Dumbbell,
  Activity,
  Target,
  Trophy,
  Shield,
  Cross,
  Smile,
  Hammer,
  Wrench,
  Ruler,
  HardHat,
  CheckCircle,
  Building,
  Tree,
  Flower,
  Scale,
  Briefcase,
  BookOpen,
  FileText,
  Calculator,
  Lightbulb,
  Users,
  Car,
  Tool,
  Camera,
  Image,
  Aperture,
  Cpu,
  Code,
  Smartphone,
  Globe,
  Zap,
  Server,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Scissors,
  Sparkles,
  Heart,
  Crown,
  Palette,
  Droplet,
  Sun,
  Star,
  Leaf,
  Wind,
  Gem,
  Utensils,
  ChefHat,
  Flame,
  Wine,
  GlassWater,
  Coffee,
  Croissant,
  Cookie,
  Pizza,
  Music,
  Moon,
  Dumbbell,
  Activity,
  Target,
  Trophy,
  Shield,
  Cross,
  Smile,
  Hammer,
  Wrench,
  Ruler,
  HardHat,
  CheckCircle,
  Building,
  Tree,
  Flower,
  Scale,
  Briefcase,
  BookOpen,
  FileText,
  Calculator,
  Lightbulb,
  Users,
  Car,
  Tool,
  Camera,
  Image,
  Aperture,
  Cpu,
  Code,
  Smartphone,
  Globe,
  Zap,
  Server,
};

interface IndustryIconProps {
  iconName: string;
  className?: string;
  style?: React.CSSProperties;
}

export function IndustryIcon({ iconName, className = "h-6 w-6", style }: IndustryIconProps) {
  const IconComponent = iconMap[iconName] || Sparkles;
  return <IconComponent className={className} style={style} />;
}

/**
 * Get industry-specific icons for a category
 */
export function getIndustryIcons(category: string): string[] {
  const cat = category.toLowerCase();

  // Hair & Beauty
  if (cat.includes("friseur") || cat.includes("hair"))
    return ["Scissors", "Sparkles", "Crown", "Palette", "Heart", "Star"];
  if (cat.includes("beauty") || cat.includes("kosmetik"))
    return ["Sparkles", "Heart", "Crown", "Palette", "Droplet", "Sun"];
  if (cat.includes("nail") || cat.includes("nagel"))
    return ["Palette", "Sparkles", "Heart", "Star", "Crown", "Gem"];
  if (cat.includes("spa") || cat.includes("wellness"))
    return ["Droplet", "Leaf", "Heart", "Sun", "Wind", "Sparkles"];

  // Food & Beverage
  if (cat.includes("restaurant") || cat.includes("gastronomie"))
    return ["Utensils", "ChefHat", "Flame", "Wine", "GlassWater", "Coffee"];
  if (cat.includes("cafe") || cat.includes("café"))
    return ["Coffee", "Croissant", "Cookie", "GlassWater", "Utensils", "Heart"];
  if (cat.includes("bar") || cat.includes("pub"))
    return ["Wine", "GlassWater", "Music", "Flame", "Star", "Moon"];
  if (cat.includes("pizza") || cat.includes("italienisch"))
    return ["Pizza", "Flame", "Utensils", "ChefHat", "Heart", "Star"];
  if (cat.includes("bäckerei") || cat.includes("baeckerei"))
    return ["Croissant", "Cookie", "Coffee", "ChefHat", "Heart", "Star"];

  // Health & Fitness
  if (cat.includes("fitness") || cat.includes("gym"))
    return ["Dumbbell", "Heart", "Flame", "Activity", "Target", "Trophy"];
  if (cat.includes("yoga") || cat.includes("pilates"))
    return ["Leaf", "Heart", "Sun", "Moon", "Wind", "Sparkles"];
  if (cat.includes("physio") || cat.includes("therapie"))
    return ["Activity", "Heart", "Droplet", "Leaf", "Sun", "Target"];
  if (cat.includes("arzt") || cat.includes("klinik") || cat.includes("medizin"))
    return ["Heart", "Activity", "Shield", "Cross", "Droplet", "Sun"];
  if (cat.includes("zahn") || cat.includes("dentist"))
    return ["Smile", "Heart", "Shield", "Sparkles", "Star", "Sun"];

  // Home & Construction
  if (cat.includes("handwerk") || cat.includes("craft"))
    return ["Hammer", "Wrench", "Ruler", "HardHat", "Shield", "CheckCircle"];
  if (cat.includes("bau") || cat.includes("construction"))
    return ["HardHat", "Ruler", "Hammer", "Shield", "CheckCircle", "Building"];
  if (cat.includes("garten") || cat.includes("gärtner"))
    return ["Leaf", "Sun", "Droplet", "Tree", "Flower", "Wind"];
  if (cat.includes("reinigung") || cat.includes("cleaning"))
    return ["Droplet", "Sparkles", "Shield", "CheckCircle", "Sun", "Wind"];

  // Professional Services
  if (cat.includes("anwalt") || cat.includes("law") || cat.includes("legal"))
    return ["Scale", "Shield", "Briefcase", "BookOpen", "FileText", "CheckCircle"];
  if (cat.includes("steuer") || cat.includes("tax") || cat.includes("buchhaltung"))
    return ["Calculator", "FileText", "Briefcase", "Shield", "CheckCircle", "BookOpen"];
  if (cat.includes("beratung") || cat.includes("consulting"))
    return ["Briefcase", "Target", "Lightbulb", "Users", "CheckCircle", "Star"];

  // Automotive
  if (cat.includes("auto") || cat.includes("car") || cat.includes("fahrzeug"))
    return ["Car", "Wrench", "Shield", "CheckCircle", "Sparkles", "Star"];
  if (cat.includes("mechanik") || cat.includes("werkstatt"))
    return ["Wrench", "Car", "Tool", "Shield", "CheckCircle", "Flame"];

  // Photography & Media
  if (cat.includes("foto") || cat.includes("photo"))
    return ["Camera", "Image", "Aperture", "Sun", "Sparkles", "Star"];
  if (cat.includes("design") || cat.includes("grafik"))
    return ["Palette", "Image", "Lightbulb", "Ruler", "Star", "Sparkles"];

  // Tech
  if (cat.includes("tech") || cat.includes("it") || cat.includes("software"))
    return ["Cpu", "Code", "Smartphone", "Globe", "Zap", "Lightbulb"];

  // Default fallback
  return ["Sparkles", "Star", "Heart", "CheckCircle", "Shield", "Target"];
}

/**
 * Get a single icon for a service based on index and category
 */
export function getServiceIcon(category: string, index: number): string {
  const icons = getIndustryIcons(category);
  return icons[index % icons.length];
}
