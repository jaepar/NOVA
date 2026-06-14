export interface Language {
  id: string;
  name: string;
  flag: string;
}

export const languages: Language[] = [
  { id: "vi", name: "Vietnamese", flag: "🇻🇳" },
  { id: "fr", name: "French", flag: "🇫🇷" },
  { id: "en", name: "English", flag: "🇬🇧" },
  { id: "ja", name: "Japanese", flag: "🇯🇵" },
  { id: "pt", name: "Portuguese", flag: "🇵🇹" },
  { id: "zh", name: "Chinese", flag: "🇨🇳" },
  { id: "ko", name: "Korean", flag: "🇰🇷" },
  { id: "ne", name: "Nepali", flag: "🇳🇵" },
  { id: "ru", name: "Russian", flag: "🇷🇺" },
];
