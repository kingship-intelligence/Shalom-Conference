import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import logoTeeImage from "@assets/image_1787592025167.png";
import comforterFrontImage from "@assets/image_1787592052575.png";
import comforterBackImage from "@assets/image_1787592065294.png";

const CASH_APP_URL = "https://cash.app/$HGAReveille";
const FINANCE_EMAIL = "finance@shalomconference.com";
const CART_STORAGE_KEY = "shalom-merch-cart";
const SIZES = ["S", "M", "L", "XL"] as const;

const PRODUCTS = [
  {
    id: "shalom-logo-tee",
    name: "Shalom Logo Tee",
    description: "A clean everyday tee with the Shalom mark front and center.",
    price: 50,
    images: [logoTeeImage],
  },
  {
    id: "comforter-tee",
    name: "The Comforter Tee",
    description: "A bold statement tee inspired by John 14:26–27.",
    price: 50,
    images: [comforterFrontImage, comforterBackImage],
  },
] as const;

type ProductId = (typeof PRODUCTS)[number]["id"];
type Size = (typeof SIZES)[number];

type CartItem = {
  productId: ProductId;
  size: Size;
  quantity: number;
};

function readCart(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as CartItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        PRODUCTS.some((product) => product.id === item.productId) &&
        SIZES.includes(item.size) &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0,
    );
  } catch {
    return [];
  }
}

export default function Shop() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<Record<ProductId, Size>>({
    "shalom-logo-tee": "M",
    "comforter-tee": "M",
  });
  const [activeImages, setActiveImages] = useState<Record<ProductId, number>>({
    "shalom-logo-tee": 0,
    "comforter-tee": 0,
  });
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    setCart(readCart());
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => {
    const product = PRODUCTS.find((candidate) => candidate.id === item.productId);
    return sum + (product?.price ?? 0) * item.quantity;
  }, 0);

  const orderSummary = useMemo(
    () =>
      cart
        .map((item) => {
          const product = PRODUCTS.find((candidate) => candidate.id === item.productId);
          return `${item.quantity} × ${product?.name} (${item.size})`;
        })
        .join(", "),
    [cart],
  );

  const addToCart = (productId: ProductId) => {
    const size = selectedSizes[productId];
    setCart((current) => {
      const existing = current.find((item) => item.productId === productId && item.size === size);
      if (existing) {
        return current.map((item) =>
          item === existing ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...current, { productId, size, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const updateQuantity = (productId: ProductId, size: Size, change: number) => {
    setCart((current) =>
      current
        .map((item) =>
          item.productId === productId && item.size === size
            ? { ...item, quantity: item.quantity + change }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeItem = (productId: ProductId, size: Size) => {
    setCart((current) =>
      current.filter((item) => !(item.productId === productId && item.size === size)),
    );
  };

  const orderEmail = `mailto:${FINANCE_EMAIL}?subject=Shalom%20merch%20preorder&body=${encodeURIComponent(
    `Hello Shalom team,\n\nI would like to preorder:\n${orderSummary}\n\nTotal: $${cartTotal.toFixed(2)}\n\nMy name and contact information:\n`,
  )}`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden px-4 py-20 text-center sm:px-6 sm:py-28">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.18),transparent_48%)]" />
          <div className="container relative z-10 mx-auto max-w-5xl">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.3em] text-primary sm:text-sm">
              Shalom Merch
            </p>
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
          <div className="container mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_360px]">
            <div className="grid gap-8 md:grid-cols-2">
              {PRODUCTS.map((product) => {
                const selectedSize = selectedSizes[product.id];
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
                        <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-white/50">
                          Select Size
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                          {SIZES.map((size) => (
                            <button
                              key={size}
                              type="button"
                              onClick={() =>
                                setSelectedSizes((current) => ({ ...current, [product.id]: size }))
                              }
                              className={`rounded-lg border py-3 text-sm font-bold transition-colors ${
                                selectedSize === size
                                  ? "border-primary bg-primary text-white"
                                  : "border-white/10 bg-white/5 text-white/60 hover:border-primary/50 hover:text-white"
                              }`}
                              aria-pressed={selectedSize === size}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>

                      <Button
                        type="button"
                        onClick={() => addToCart(product.id)}
                        className="mt-7 h-12 w-full rounded-none bg-primary font-bold uppercase tracking-wider text-white hover:bg-primary/90"
                      >
                        Add to Cart <Plus className="h-5 w-5" />
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>

            <aside
              className={`h-fit rounded-2xl border border-white/10 bg-background/80 p-6 lg:sticky lg:top-24 ${
                cartOpen ? "block" : "hidden lg:block"
              }`}
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-black uppercase tracking-tight text-white">Your Cart</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setCartOpen(false)}
                  className="rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white lg:hidden"
                  aria-label="Close cart"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 p-6 text-center">
                  <ShoppingBag className="mx-auto mb-3 h-8 w-8 text-white/30" />
                  <p className="text-sm text-muted-foreground">Your cart is ready for something good.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {cart.map((item) => {
                    const product = PRODUCTS.find((candidate) => candidate.id === item.productId);
                    if (!product) return null;
                    return (
                      <div key={`${item.productId}-${item.size}`} className="border-b border-white/10 pb-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-bold text-white">{product.name}</p>
                            <p className="mt-1 text-xs uppercase tracking-wider text-white/50">
                              Size {item.size} · ${product.price} each
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.productId, item.size)}
                            className="text-white/40 hover:text-primary"
                            aria-label={`Remove ${product.name} size ${item.size}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-3 rounded-full border border-white/10 px-2 py-1">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.productId, item.size, -1)}
                              className="rounded-full p-1 text-white/60 hover:bg-white/10 hover:text-white"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="min-w-4 text-center text-sm font-bold text-white">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.productId, item.size, 1)}
                              className="rounded-full p-1 text-white/60 hover:bg-white/10 hover:text-white"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <p className="font-bold text-white">${(product.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    );
                  })}

                  <div className="flex items-center justify-between text-lg font-black uppercase text-white">
                    <span>Total</span>
                    <span className="text-primary">${cartTotal.toFixed(2)}</span>
                  </div>

                  <div className="rounded-xl border border-primary/30 bg-primary/10 p-4">
                    <p className="text-sm leading-relaxed text-white/80">
                      Pay through Cash App, then email your order details to finance so we can confirm your preorder.
                    </p>
                    <Button
                      asChild
                      className="mt-4 w-full rounded-none bg-primary font-bold uppercase tracking-wider text-white hover:bg-primary/90"
                    >
                      <a href={CASH_APP_URL} target="_blank" rel="noopener noreferrer">
                        Pay ${cartTotal.toFixed(2)} via Cash App <ArrowRight className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="mt-3 w-full rounded-none border-white/20 font-bold uppercase tracking-wider text-white"
                    >
                      <a href={orderEmail}>Email Order Details</a>
                    </Button>
                    <p className="mt-3 text-center font-mono text-xs text-primary">$HGAReveille</p>
                  </div>
                </div>
              )}

              <p className="mt-5 text-center text-xs leading-relaxed text-white/40">
                Your cart is saved on this device and will remain after you navigate away or refresh.
              </p>
            </aside>
          </div>
        </section>
      </main>
      <SiteFooter />

      <button
        type="button"
        onClick={() => setCartOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-3 rounded-full bg-primary px-5 py-3 font-bold uppercase tracking-wider text-white shadow-lg shadow-primary/30 lg:hidden"
        aria-label={`Open cart with ${cartCount} item${cartCount === 1 ? "" : "s"}`}
      >
        <ShoppingBag className="h-5 w-5" />
        Cart {cartCount > 0 && `(${cartCount})`}
      </button>
    </div>
  );
}