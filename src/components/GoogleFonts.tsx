import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Check, Search } from 'lucide-react';

// Popular Google Fonts list (curated for better user experience)
const GOOGLE_FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Montserrat', 'Source Sans 3', 'Nunito Sans',
  'Playfair Display', 'Merriweather', 'Lora', 'PT Serif', 'Crimson Text', 'Libre Baskerville',
  'DM Sans', 'Karla', 'Work Sans', 'Mulish', 'Rubik', 'Nunito', 'Barlow', 'Manrope',
  'Oswald', 'Raleway', 'Ubuntu', 'Mukti', 'Fira Sans', 'Libre Franklin', 'IBM Plex Sans',
  'Source Code Pro', 'JetBrains Mono', 'Fira Code', 'Inconsolata', 'Space Mono',
  'Dancing Script', 'Pacifico', 'Lobster', 'Great Vibes', 'Satisfy', 'Kaushan Script',
  'Bebas Neue', 'Anton', 'Fjalla One', 'Titillium Web', 'Cabin', 'Prompt', 'Quicksand',
  'Heebo', 'Arimo', 'Tinos', 'Cousine', 'Noto Sans', 'Noto Serif', 'PT Sans', 'PT Sans Narrow',
  'Dosis', 'Exo 2', 'Cantarell', 'Oxygen', 'Catamaran', 'Varela Round', 'Comfortaa',
  'Abril Fatface', 'Righteous', 'Fredoka One', 'Orbitron', 'Audiowide', 'Bungee',
  'Caveat', 'Indie Flower', 'Permanent Marker', 'Shadows Into Light', 'Amatic SC',
  'Cormorant Garamond', 'Crimson Pro', 'Spectral', 'Vollkorn', 'Bitter', 'Old Standard TT',
  'Alegreya', 'Alegreya Sans', 'Source Serif 4', 'Zilla Slab', 'Slabo 27px', 'Arvo',
  'Muli', 'Hind', 'Yanone Kaffeesatz', 'Archivo', 'Archivo Narrow', 'Maven Pro',
  'Red Hat Display', 'Red Hat Text', 'Spartan', 'Overpass', 'Chivo', 'BenchNine',
  'Abel', 'Asap', 'Assistant', 'Cairo', 'Francois One', 'Staatliches', 'Concert One',
  'Russo One', 'Squada One', 'Alfa Slab One', 'Crete Round', 'Rokkitt', 'Ultra',
  'Philosopher', 'Pontano Sans', 'Questrial', 'Gudea', 'Tenor Sans', 'Advent Pro',
  'Signika', 'Signika Negative', 'Pathway Gothic One', 'Cuprum', 'Economica', 'Jura'
];

interface GoogleFontSelectorProps {
  selectedFont: string;
  onFontChange: (font: string) => void;
  label?: string;
  placeholder?: string;
}

export const GoogleFontSelector: React.FC<GoogleFontSelectorProps> = ({
  selectedFont,
  onFontChange,
  label = "Font Family",
  placeholder = "Search fonts..."
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredFonts = useMemo(() => {
    return GOOGLE_FONTS.filter(font =>
      font.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleFontSelect = (font: string) => {
    onFontChange(font);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        <Button
          variant="outline"
          className="w-full justify-between font-normal"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span style={{ fontFamily: selectedFont }} className="truncate">
            {selectedFont}
          </span>
          <Search className="h-4 w-4 opacity-50" />
        </Button>
        
        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border rounded-md shadow-md">
            <div className="p-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={placeholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                  autoFocus
                />
              </div>
            </div>
            
            <ScrollArea className="h-60">
              <div className="p-1">
                {filteredFonts.map((font) => (
                  <Button
                    key={font}
                    variant="ghost"
                    className="w-full justify-start font-normal h-auto py-2 px-3"
                    onClick={() => handleFontSelect(font)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span style={{ fontFamily: font }} className="truncate">
                        {font}
                      </span>
                      {selectedFont === font && (
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      )}
                    </div>
                  </Button>
                ))}
                
                {filteredFonts.length === 0 && (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No fonts found matching "{searchTerm}"
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
};