import logoImage from "@assets/logo.png";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function Logo({ className = "", size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10", 
    lg: "w-16 h-16"
  };

  return (
    <img 
      src={logoImage} 
      alt="MyBillPort Logo" 
      className={`object-contain ${sizeClasses[size]} ${className}`}
    />
  );
}