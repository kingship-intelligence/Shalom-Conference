import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Info, ShoppingBag, X, Plus, Minus, ArrowRight } from "lucide-react";

import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Sheet, SheetContent, SheetClose, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

import { MerchOrderItemSize, useCreateMerchOrder } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

import tee1 from "@/assets/merch/tee-1.png";
import tee2 from "@/assets/merch/tee-2.png";
import crew1 from "@/assets/merch/crew-1.png";
import crew2 from "@/assets/merch/crew-2.png";

const SIZES = ["S", "M", "L", "XL", "XXL"] as const;

type CartItem = {
  id: string; // internal id: productId + size
  productName: string;
  size: (typeof SIZES)[number];
  quantity: number;
  price: number;
  image: string;
};

const PRODUCTS = [
  {
    id: "comforter-tee",
    name: "The Comforter Tee",
    price: 30,
    image: tee1,
  },
  {
    id: "comforter-tee-shalom",
    name: "The Comforter Tee — Shalom Edition",
    price: 30,
    image: tee2,
  },
  {
    id: "comforter-crewneck",
    name: "The Comforter Crewneck",
    price: 40,
    image: crew1,
  },
  {
    id: "comforter-crewneck-shalom",
    name: "The Comforter Crewneck — Shalom Edition",
    price: 40,
    image: crew2,
  },
];

const checkoutSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  paymentReference: z.string().min(1, "Cash App reference is required"),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

function ProductCard({ product, onAdd }: { product: typeof PRODUCTS[0]; onAdd: (item: CartItem) => void }) {
  const [size, setSize] = useState<(typeof SIZES)[number]>("M");

  return (
    <div className="group flex flex-col border border-white/10 bg-black overflow-hidden transition-colors hover:border-primary/50 relative">
      <div className="aspect-[4/5] w-full overflow-hidden bg-white/5 relative">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-8">
        <h3 className="text-2xl font-bold uppercase tracking-widest text-white leading-tight">
          {product.name}
        </h3>
        <p className="mt-3 text-3xl font-black text-primary">${product.price}</p>

        <div className="mt-8 flex-1">
          <p className="mb-4 text-xs uppercase tracking-widest text-white/50 font-bold">Select Size</p>
          <div className="flex flex-wrap gap-3">
            {SIZES.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={cn(
                  "flex h-12 w-12 items-center justify-center border text-sm font-bold transition-all",
                  size === s
                    ? "border-primary bg-primary text-white"
                    : "border-white/20 bg-transparent text-white hover:border-white hover:bg-white/5"
                )}
                data-testid={`btn-size-${product.id}-${s}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={() =>
            onAdd({
              id: `${product.id}-${size}`,
              productName: product.name,
              size,
              quantity: 1,
              price: product.price,
              image: product.image,
            })
          }
          className="mt-10 w-full rounded-none bg-white text-black hover:bg-primary hover:text-white font-bold uppercase tracking-widest h-14"
          data-testid={`btn-add-${product.id}`}
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
}

export default function Shop() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [successOrder, setSuccessOrder] = useState<any | null>(null);

  const createOrder = useCreateMerchOrder();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      paymentReference: "",
    },
  });

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i));
      }
      return [...prev, item];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            return { ...item, quantity: item.quantity + delta };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const onSubmit = (data: CheckoutFormValues) => {
    createOrder.mutate(
      {
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          paymentReference: data.paymentReference,
          items: cart.map((item) => ({
            productName: item.productName,
            size: item.size as MerchOrderItemSize,
            quantity: item.quantity,
          })),
          total,
        },
      },
      {
        onSuccess: (res) => {
          setSuccessOrder(res);
          form.reset();
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />

      <main className="flex-1 pb-24">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-white/10 bg-black pt-24 pb-16 sm:pt-32 sm:pb-24">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
          <div className="container relative mx-auto px-4 text-center">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-primary">Shalom Merch</p>
            <h1
              className="text-6xl font-black uppercase leading-none tracking-tighter text-white sm:text-7xl md:text-8xl lg:text-9xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Wear The <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Fire</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
              Official merchandise for the Shalom Youth Conference. Preorder now. All items are premium quality and made to last.
            </p>
          </div>
        </section>

        {/* Products Grid */}
        <section className="container mx-auto px-4 py-16 sm:py-24 sm:px-6 lg:max-w-6xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:gap-12">
            {PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} onAdd={addToCart} />
            ))}
          </div>
        </section>
      </main>

      {/* Floating Cart Button */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-8 right-8 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-2xl hover:bg-primary/90 hover:scale-105 transition-all border-2 border-transparent hover:border-white/20"
            data-testid="btn-floating-cart"
          >
            <ShoppingBag className="h-6 w-6" />
            <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-black text-black shadow-md border-2 border-primary">
              {cart.reduce((a, b) => a + b.quantity, 0)}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cart Sheet */}
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent className="flex w-full flex-col bg-black border-l border-white/10 sm:max-w-md p-0 overflow-hidden">
          <SheetTitle className="sr-only">Shopping Cart</SheetTitle>
          <div className="flex h-20 items-center justify-between border-b border-white/10 px-6 bg-black/80 backdrop-blur-md">
            <h2 className="text-xl font-black uppercase tracking-widest text-white flex items-center gap-3">
              <ShoppingBag className="h-6 w-6 text-primary" />
              Your Cart
            </h2>
            <SheetClose className="text-white/50 hover:text-white transition-colors p-2" data-testid="btn-close-cart">
              <X className="h-6 w-6" />
            </SheetClose>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {cart.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <ShoppingBag className="mb-6 h-16 w-16 text-white/10" />
                <p className="text-white/50 uppercase tracking-widest text-sm font-bold">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-8">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-5 group" data-testid={`cart-item-${item.id}`}>
                    <div className="h-32 w-28 flex-shrink-0 bg-white/5 border border-white/10 overflow-hidden">
                      <img src={item.image} alt={item.productName} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col justify-between py-1">
                      <div>
                        <h4 className="text-base font-bold text-white leading-tight pr-4">{item.productName}</h4>
                        <p className="text-xs uppercase tracking-widest text-white/50 mt-2 font-bold">Size: {item.size}</p>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-white/20">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="px-3 py-1.5 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                            data-testid={`btn-dec-${item.id}`}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-3 text-sm font-bold text-white w-10 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="px-3 py-1.5 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                            data-testid={`btn-inc-${item.id}`}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-lg font-black text-primary">${item.price * item.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="border-t border-white/10 p-6 bg-black z-10 sticky bottom-0">
              <div className="flex justify-between mb-6 items-center">
                <span className="text-sm font-bold uppercase tracking-widest text-white/50">Subtotal</span>
                <span className="text-3xl font-black text-white">${total}</span>
              </div>
              <Button
                className="w-full rounded-none bg-white text-black hover:bg-primary hover:text-white h-16 text-base font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-3"
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckoutOpen(true);
                }}
                data-testid="btn-proceed-checkout"
              >
                Checkout <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="max-w-lg bg-black border-white/10 p-0 text-white rounded-none sm:rounded-none overflow-hidden">
          <DialogTitle className="sr-only">Checkout</DialogTitle>
          <DialogDescription className="sr-only">Fill out your details to place a preorder.</DialogDescription>

          {successOrder ? (
            <div className="flex flex-col items-center justify-center p-12 text-center" data-testid="checkout-success">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <h2 className="mb-4 text-3xl font-black uppercase tracking-widest text-white">Order Received</h2>
              <p className="mb-8 text-white/60 leading-relaxed text-lg">
                Your order <strong className="text-white">#{successOrder.id}</strong> is awaiting manual verification. We will email you once payment is confirmed.
              </p>
              <Button
                onClick={() => {
                  setSuccessOrder(null);
                  setIsCheckoutOpen(false);
                  setCart([]);
                }}
                className="w-full rounded-none bg-white text-black hover:bg-white/90 h-14 font-bold uppercase tracking-widest"
                data-testid="btn-success-continue"
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="flex flex-col max-h-[90vh]">
              <div className="border-b border-white/10 p-6 flex justify-between items-center bg-black/50 backdrop-blur-sm z-10 sticky top-0">
                <h2 className="text-xl font-black uppercase tracking-widest text-white">Checkout</h2>
              </div>

              <div className="overflow-y-auto p-6 space-y-8">
                <div
                  className="border border-primary/30 bg-primary/5 p-5 text-sm text-primary/90"
                  data-testid="payment-instructions"
                >
                  <h3 className="font-bold mb-4 uppercase tracking-widest flex items-center gap-2 text-primary">
                    <Info className="h-5 w-5" />
                    Payment Instructions
                  </h3>
                  <div className="space-y-3 text-white/80 leading-relaxed text-base">
                    <p>
                      1. Send exactly <strong className="text-primary">${total}</strong> to{" "}
                      <strong className="text-white">$HGAReveille</strong> on Cash App.
                    </p>
                    <p>2. Include your name in the payment note.</p>
                    <p>3. Paste your Cash App reference number below.</p>
                  </div>
                  <p className="mt-5 text-xs uppercase tracking-widest text-primary/70 font-bold border-t border-primary/20 pt-4">
                    Orders are manually verified. Submitting this form does not confirm payment.
                  </p>
                </div>

                <Form {...form}>
                  <form id="checkout-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase tracking-widest text-white/70">Full Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John Doe"
                              className="h-14 bg-white/5 border-white/10 rounded-none focus-visible:ring-primary focus-visible:border-primary text-white px-4 text-base"
                              {...field}
                              data-testid="input-checkout-name"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-secondary" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase tracking-widest text-white/70">
                            Email Address
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="john@example.com"
                              className="h-14 bg-white/5 border-white/10 rounded-none focus-visible:ring-primary focus-visible:border-primary text-white px-4 text-base"
                              {...field}
                              data-testid="input-checkout-email"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-secondary" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase tracking-widest text-white/70">
                            Phone Number <span className="text-white/30 lowercase tracking-normal">(Optional)</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="(555) 123-4567"
                              className="h-14 bg-white/5 border-white/10 rounded-none focus-visible:ring-primary focus-visible:border-primary text-white px-4 text-base"
                              {...field}
                              data-testid="input-checkout-phone"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-secondary" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="paymentReference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase tracking-widest text-white/70">
                            Cash App Reference
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="#ABC123XYZ or Cash App link"
                              className="h-14 bg-white/5 border-white/10 rounded-none focus-visible:ring-primary focus-visible:border-primary text-white px-4 text-base"
                              {...field}
                              data-testid="input-checkout-reference"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-secondary" />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </div>

              <div className="border-t border-white/10 p-6 bg-black sticky bottom-0 z-10">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm font-bold uppercase tracking-widest text-white/50">Total</span>
                  <span className="text-3xl font-black text-white">${total}</span>
                </div>
                <Button
                  type="submit"
                  form="checkout-form"
                  disabled={createOrder.isPending}
                  className="w-full rounded-none bg-primary text-white hover:bg-primary/90 h-16 text-base font-black uppercase tracking-widest"
                  data-testid="btn-checkout-submit"
                >
                  {createOrder.isPending ? "Submitting..." : `Submit Preorder`}
                </Button>
                {createOrder.isError && (
                  <p className="mt-4 text-center text-xs font-bold uppercase tracking-widest text-secondary">
                    Failed to submit order. Please try again.
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <SiteFooter />
    </div>
  );
}
