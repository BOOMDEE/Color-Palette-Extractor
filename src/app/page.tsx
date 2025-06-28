"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CloudUpload,
  Loader2,
  Palette,
  Trash2,
  Save,
} from "lucide-react";
import ColorThief from "colorthief";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ColorPaletteDisplay } from "@/components/color-palette-display";

type SavedPalette = {
  id: string;
  colors: string[];
  image: string;
};

const LOCAL_STORAGE_KEY = "color-palette-extractor-saved-palettes";

export default function Home() {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedColors, setExtractedColors] = useState<string[] | null>(null);
  const [savedPalettes, setSavedPalettes] = useState<SavedPalette[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const storedPalettes = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedPalettes) {
        setSavedPalettes(JSON.parse(storedPalettes));
      }
    } catch (e) {
      console.error("Failed to load palettes from local storage", e);
    }
  }, []);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setExtractedColors(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExtractColors = () => {
    if (!imagePreview) return;

    setIsLoading(true);
    setError(null);
    setExtractedColors(null);

    const img = new window.Image();
    img.src = imagePreview;
    img.crossOrigin = "Anonymous";

    img.onload = () => {
      try {
        const colorThief = new ColorThief();
        const palette = colorThief.getPalette(img, 8);
        const hexPalette = palette.map(
          (rgb: [number, number, number]) =>
            `#${rgb.map((c) => c.toString(16).padStart(2, "0")).join("")}`
        );
        setExtractedColors(hexPalette);
      } catch (e) {
        console.error(e);
        setError("Could not extract colors. Please try a different image.");
      } finally {
        setIsLoading(false);
      }
    };
    img.onerror = () => {
      setError("Could not load image to extract colors.");
      setIsLoading(false);
    };
  };

  const handleSavePalette = () => {
    if (!extractedColors || !imagePreview) return;

    const newPalette: SavedPalette = {
      id: Date.now().toString(),
      colors: extractedColors,
      image: imagePreview,
    };

    const updatedPalettes = [newPalette, ...savedPalettes];
    setSavedPalettes(updatedPalettes);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPalettes));
    toast({
      title: "Palette Saved!",
      description: "Your new color palette has been saved.",
    });
  };

  const handleDeletePalette = (id: string) => {
    const updatedPalettes = savedPalettes.filter((p) => p.id !== id);
    setSavedPalettes(updatedPalettes);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPalettes));
    toast({
      title: "Palette Deleted",
      description: "The color palette has been removed.",
      variant: "destructive",
    });
  };

  const handleCopyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    toast({
      title: "Copied!",
      description: `${color} copied to clipboard.`,
    });
  };

  const resetState = () => {
    setImagePreview(null);
    setExtractedColors(null);
    setError(null);
    setIsLoading(false);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  return (
    <div className="min-h-screen bg-secondary/50">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight bg-gradient-to-r from-primary to-purple-400 text-transparent bg-clip-text">
            Color Palette Extractor
          </h1>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            Instantly discover the color palette of any image.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-3 space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="text-primary" />
                  Color Extractor
                </CardTitle>
                <CardDescription>
                  Upload an image to generate a beautiful color palette.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {imagePreview ? (
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden border">
                    <Image
                      src={imagePreview}
                      alt="Selected preview"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                ) : (
                  <div
                    className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary hover:bg-accent transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <CloudUpload className="w-12 h-12 text-muted-foreground" />
                    <p className="mt-4 font-semibold text-primary">
                      Click to upload an image
                    </p>
                    <p className="text-sm text-muted-foreground">
                      PNG, JPG, WEBP recommended
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                  accept="image/png, image/jpeg, image/webp"
                />
              </CardContent>
              {imagePreview && (
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={resetState}>Change Image</Button>
                  <Button onClick={handleExtractColors} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Extracting...
                      </>
                    ) : (
                      "Extract Colors"
                    )}
                  </Button>
                </CardFooter>
              )}
            </Card>

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Extraction Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {extractedColors && (
              <Card className="shadow-lg animate-in fade-in">
                <CardHeader>
                  <CardTitle>Extracted Palette</CardTitle>
                </CardHeader>
                <CardContent>
                  <ColorPaletteDisplay
                    colors={extractedColors}
                    onCopyColor={handleCopyColor}
                  />
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSavePalette} className="w-full">
                    <Save className="mr-2 h-4 w-4" /> Save Palette
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>

          <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Saved Palettes</CardTitle>
                <CardDescription>
                  Your locally saved color palettes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {savedPalettes.length > 0 ? (
                  <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
                    {savedPalettes.map((palette) => (
                      <Card key={palette.id} className="overflow-hidden">
                        <div className="relative aspect-video w-full">
                          <Image
                            src={palette.image}
                            alt="Saved palette image"
                            layout="fill"
                            objectFit="cover"
                          />
                        </div>
                        <div className="p-4">
                        <ColorPaletteDisplay
                          colors={palette.colors}
                          onCopyColor={handleCopyColor}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeletePalette(palette.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </ColorPaletteDisplay>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <p>No palettes saved yet.</p>
                    <p className="text-sm">
                      Extract a palette to save it here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
