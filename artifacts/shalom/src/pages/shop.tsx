import { useState } from "react";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import logoTeeImage from "@assets/image_1787592025167.png";
import comforterFrontImage from "@assets/image_1787592052575.png";
import comforterBackImage from "@assets/image_1787592065294.png";

const SIZES = ["S", "M", "L", "XL", "XXL"] as const;

const PRODUCTS = [
  {
    id: "comforter-tee",
    name: "The Comforter Tee",
    description: "Shalom on the front, with a Comforter design on the back.",
    price: 35,
    images: [comforterFrontImage, logoTeeImage],
  },
  {
    id: "comforter-tee-alt",
    name: "The Comforter Tee — Shalom Edition",
    description: "Shalom on the front, with a Comforter design on the back.",
    price: 35,
    images: [comforterBackImage, logoTeeImage],
  },
] as const;

export default function Shop() {
  const [activeImages, setActiveImages] = useState<Record<string, number>>({
    "comforter-tee": 0,
    "comforter-tee-alt": 0,
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden px-4 py-20 text-center sm:px-6 sm:py-28">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.18),transparent_48%)]" />
          <div className="container relative z-10 mx-auto max-w-5xl">
            <h1
              className="mb-8 text-5xl font-black uppercase leading-none tracking-tighter text-white sm:text-7xl md:text-8xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Wear The Vision
            </h1>
            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-muted-foreground sm:text-2xl">
              Pre-order your Shalom tee and carry the message of comforter,
              worship, and renewal wherever you go.
            </p>
          </div>
        </section>

        <section className="border-y border-white/10 bg-card px-4 py-16 sm:px-6 sm:py-20">
          <div className="container mx-auto max-w-7xl">
            <div className="grid gap-8 md:grid-cols-2">
              {PRODUCTS.map((product) => {
                const imageIndex = activeImages[product.id] ?? 0;
                return (
                  <article
                    key={product.id}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-background/70"
                  >
                    <div className="aspect-square overflow-hidden bg-white">
                      <img
                        src={product.images[imageIndex]}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    {product.images.length > 1 && (
                      <div className="flex gap-2 border-b border-white/10 bg-background p-3">
                        {product.images.map((image, index) => (
                          <button
                            key={image}
                            type="button"
                            onClick={() =>
                              setActiveImages((current) => ({ ...current, [product.id]: index }))
                            }
                            className={`h-14 w-14 overflow-hidden rounded-lg border-2 ${
                              imageIndex === index ? "border-primary" : "border-white/10"
                            }`}
                            aria-label={`View ${product.name} image ${index + 1}`}
                          >
                            <img src={image} alt="" className="h-full w-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="p-6 sm:p-8">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                            {product.name}
                          </h2>
                          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                            {product.description}
                          </p>
                        </div>
                        <p className="shrink-0 text-2xl font-black text-primary">${product.price}</p>
                      </div>

                      <div className="mt-7">
                        <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/50">
                          Available sizes
                        </p>
                        <p className="mt-3 text-sm font-bold tracking-wider text-white/70">
                          {SIZES.join(" · ")}
                        </p>
                      </div>

                      <Button
                        type="button"
                        disabled
                        className="mt-7 h-12 w-full cursor-not-allowed rounded-none bg-primary/20 font-bold uppercase tracking-wider text-primary"
                      >
                        Coming Soon
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />

    </div>
  );
}