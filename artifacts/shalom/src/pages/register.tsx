import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, Calendar, MapPin, Sparkles, Upload, X } from "lucide-react";
import {
  useCreateRegistration,
  useRequestExistingRegistrationBadge,
  useRequestRegistrationBadgeUploadUrl,
  useCompleteRegistrationBadge,
  useSkipRegistrationBadge
} from "@workspace/api-client-react";
import shalomLogo from "@assets/logo_1778697155106.png";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/SiteHeader";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

const VOLUNTEER_ROLES = [
  "Media",
  "Ushers",
  "Protocol",
  "Parking",
  "Welcome Team",
  "Setup Crew",
  "Clean Up Crew",
  "Child Care Crew",
  "Merch Crew",
] as const;

const registrationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  conferenceYear: z.number().default(2026),
  volunteer: z.boolean().default(false),
  volunteerRole: z.string().optional(),
  hasPlusOne: z.boolean().default(false),
  plusOne: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Please enter a valid email"),
    phone: z.string().optional(),
  }).optional(),
  wantsAttendeeBadge: z.boolean().default(false),
  portraitFile: z.any().optional(),
}).refine(
  (d) => !d.volunteer || !!d.volunteerRole,
  { message: "Please select a volunteer role", path: ["volunteerRole"] }
).refine(
  (d) => !d.hasPlusOne || !!d.plusOne,
  { message: "Please add your plus one’s details", path: ["plusOne"] }
).refine(
  (d) => {
    if (d.wantsAttendeeBadge && !d.portraitFile) return false;
    return true;
  },
  { message: "Please select a portrait photo for your badge", path: ["portraitFile"] }
).refine(
  (d) => {
    if (d.wantsAttendeeBadge && d.portraitFile) {
      const file = d.portraitFile as File;
      if (file.size > 5 * 1024 * 1024) return false;
    }
    return true;
  },
  { message: "Photo must be less than 5MB", path: ["portraitFile"] }
).refine(
  (d) => {
    if (d.wantsAttendeeBadge && d.portraitFile) {
      const file = d.portraitFile as File;
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return false;
    }
    return true;
  },
  { message: "Photo must be JPG, PNG, or WebP", path: ["portraitFile"] }
);

type RegistrationInput = z.infer<typeof registrationSchema>;
type SubmitStage = "idle" | "registering" | "requesting" | "preparing" | "uploading" | "finishing";

const STAGE_MESSAGES: Record<SubmitStage, string> = {
  idle: "Confirm Registration",
  registering: "Securing your spot...",
  requesting: "Finding your registration...",
  preparing: "Preparing badge...",
  uploading: "Uploading photo...",
  finishing: "Finalizing details...",
};

const existingBadgeSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
});

type ExistingBadgeInput = z.infer<typeof existingBadgeSchema>;

function getPortraitValidationMessage(file: File): string | null {
  if (file.size > 5 * 1024 * 1024) return "Photo must be less than 5MB";
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return "Photo must be JPG, PNG, or WebP";
  }
  return null;
}

function PortraitUpload({ value, onChange }: { value?: File; onChange: (f?: File) => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (value) {
      const url = URL.createObjectURL(value);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreview(null);
    return undefined;
  }, [value]);

  const handleFile = (file?: File) => {
    if (file) {
      onChange(file);
    }
  };

  return (
    <div
      className={`group relative flex aspect-[4/5] w-full max-w-md flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
        isDragging
          ? "border-primary bg-primary/10"
          : value
          ? "border-white/20 bg-white/5"
          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleFile(e.dataTransfer.files[0]);
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
        aria-label="Upload portrait photo"
      />

      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-5 w-full relative z-10"
          >
            <div className="relative aspect-[4/5] w-40 overflow-hidden rounded-2xl border-2 border-primary shadow-[0_0_30px_rgba(234,88,12,0.3)]">
              <img src={preview} alt="Portrait preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(undefined);
                }}
                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                aria-label="Remove photo"
              >
                <X className="w-8 h-8 text-white" />
              </button>
            </div>
            <div className="space-y-3 w-full">
              <div className="text-sm font-bold text-white/90 truncate px-4 max-w-xs mx-auto">
                {value?.name}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => inputRef.current?.click()}
                className="rounded-full bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white h-10 px-6"
              >
                Change Photo
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 cursor-pointer w-full h-full justify-center relative z-10"
            onClick={() => inputRef.current?.click()}
          >
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <p className="text-white font-bold text-lg">Click to upload or drag and drop</p>
              <p className="text-white/50 text-sm">JPG, PNG, WebP (Max 5MB)</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ExistingRegistrationBadge() {
  const [portraitFile, setPortraitFile] = useState<File>();
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitStage, setSubmitStage] = useState<SubmitStage>("idle");
  const { toast } = useToast();
  const requestExistingBadge = useRequestExistingRegistrationBadge();
  const requestUploadUrl = useRequestRegistrationBadgeUploadUrl();
  const completeBadge = useCompleteRegistrationBadge();
  const skipBadge = useSkipRegistrationBadge();
  const form = useForm<ExistingBadgeInput>({
    resolver: zodResolver(existingBadgeSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
  });

  const isLoading = submitStage !== "idle";

  const onSubmit = async (data: ExistingBadgeInput) => {
    if (!portraitFile) {
      toast({
        title: "Portrait photo required",
        description: "Please select a portrait photo for your badge.",
        variant: "destructive",
      });
      return;
    }

    const portraitError = getPortraitValidationMessage(portraitFile);
    if (portraitError) {
      toast({
        title: "Invalid portrait photo",
        description: portraitError,
        variant: "destructive",
      });
      return;
    }

    let access: { registrationId: number; badgeUploadToken: string } | undefined;
    try {
      setSubmitStage("requesting");
      access = await requestExistingBadge.mutateAsync({
        data: {
          ...data,
          conferenceYear: 2026,
        },
      });

      setSubmitStage("preparing");
      const uploadUrlRes = await requestUploadUrl.mutateAsync({
        registrationId: access.registrationId,
        data: {
          token: access.badgeUploadToken,
          name: portraitFile.name,
          size: portraitFile.size,
          contentType: portraitFile.type as "image/jpeg" | "image/png" | "image/webp",
        },
      });

      setSubmitStage("uploading");
      const putRes = await fetch(uploadUrlRes.uploadURL, {
        method: "PUT",
        headers: {
          "Content-Type": portraitFile.type,
        },
        body: portraitFile,
      });

      if (!putRes.ok) {
        throw new Error(`Upload failed with status: ${putRes.status}`);
      }

      setSubmitStage("finishing");
      const completion = await completeBadge.mutateAsync({
        registrationId: access.registrationId,
        data: {
          token: access.badgeUploadToken,
          objectPath: uploadUrlRes.objectPath,
        },
      });

      if (completion.badgeDeliveryStatus !== "delivered") {
        throw new Error("Badge delivery was not completed");
      }

      setIsSuccess(true);
    } catch (error: any) {
      if (access) {
        await skipBadge.mutateAsync({
          registrationId: access.registrationId,
          data: { token: access.badgeUploadToken },
        }).catch(() => undefined);
      }
      setSubmitStage("idle");

      if (error?.status === 404) {
        toast({
          title: "Registration not found",
          description: "Use the same first name, last name, and email address from your Shalom 2026 registration.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Badge Creation Failed",
          description: "We couldn't create your badge right now. Please check your photo and try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center space-y-8 p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl"
        >
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center text-primary shadow-[0_0_30px_rgba(234,88,12,0.3)]">
              <CheckCircle2 className="h-10 w-10" />
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold italic text-white" style={{ fontFamily: "var(--font-display)" }}>
              Your Badge Is On Its Way
            </h1>
            <p className="text-white/70 text-lg">
              Your personalized “I’m Attending” badge has been created and sent to your registration email.
            </p>
          </div>
          <Button asChild className="w-full h-14 whitespace-normal rounded-full bg-gradient-to-r from-primary to-secondary text-center text-white font-bold uppercase leading-tight tracking-widest border-none">
            <Link href="/2026">Back to Shalom 2026</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground relative pb-20">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 rounded-full bg-secondary/10 blur-[100px]" />
      </div>

      <SiteHeader />

      <main className="container relative z-10 mx-auto max-w-2xl px-4 mt-8">
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-8">
            <img src={shalomLogo} alt="SHALOM" className="h-16 w-auto" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-primary"
          >
            Already registered for Shalom 2026?
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-6xl font-bold uppercase italic text-white mb-6"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Create Your Badge
          </motion.h1>
          <p className="mx-auto max-w-xl text-white/60">
            Enter the same details you used to register, upload a portrait, and we’ll email you a personalized “I’m Attending” badge.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl"
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/50 uppercase tracking-widest text-xs font-bold">First Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John"
                          {...field}
                          className="bg-white/5 border-white/10 h-14 rounded-xl text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/20"
                          data-testid="input-badge-firstName"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/50 uppercase tracking-widest text-xs font-bold">Last Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Doe"
                          {...field}
                          className="bg-white/5 border-white/10 h-14 rounded-xl text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/20"
                          data-testid="input-badge-lastName"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/50 uppercase tracking-widest text-xs font-bold">Registration Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        {...field}
                        className="bg-white/5 border-white/10 h-14 rounded-xl text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/20"
                        data-testid="input-badge-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <label className="text-white/50 uppercase tracking-widest text-xs font-bold">Portrait Photo</label>
                <PortraitUpload value={portraitFile} onChange={setPortraitFile} />
                <p className="text-center text-xs text-white/40">Use a clear portrait photo. JPG, PNG, or WebP up to 5MB.</p>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-16 whitespace-normal rounded-full bg-gradient-to-r from-primary to-secondary text-xl font-bold uppercase leading-tight tracking-widest text-center text-white shadow-[0_0_30px_rgba(234,88,12,0.4)] hover:shadow-[0_0_50px_rgba(234,88,12,0.6)] transition-all border-none mt-4 relative overflow-hidden"
                data-testid="button-create-badge"
              >
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-3 absolute inset-0 justify-center"
                    >
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="text-lg">{STAGE_MESSAGES[submitStage]}</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 absolute inset-0 justify-center"
                    >
                      Create My Badge <ArrowRight className="h-6 w-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="opacity-0 flex items-center gap-2">Create My Badge <ArrowRight className="h-6 w-6" /></div>
              </Button>

              <Button asChild type="button" variant="ghost" className="w-full whitespace-normal text-center leading-tight text-white/60 hover:bg-white/5 hover:text-white">
                <Link href="/2026">Back to 2026 Conference Details</Link>
              </Button>
            </form>
          </Form>
        </motion.div>
      </main>
    </div>
  );
}

function RegistrationForm() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [badgeDelivered, setBadgeDelivered] = useState(false);
  const [registeredPlusOne, setRegisteredPlusOne] = useState(false);
  const [submitStage, setSubmitStage] = useState<SubmitStage>("idle");

  const { toast } = useToast();

  const createRegistration = useCreateRegistration();
  const requestUploadUrl = useRequestRegistrationBadgeUploadUrl();
  const completeBadge = useCompleteRegistrationBadge();
  const skipBadge = useSkipRegistrationBadge();

  const form = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      conferenceYear: 2026,
      volunteer: false,
      volunteerRole: "",
      hasPlusOne: false,
      plusOne: undefined,
      wantsAttendeeBadge: false,
      portraitFile: undefined,
    },
  });

  const isVolunteer = form.watch("volunteer");
  const hasPlusOne = form.watch("hasPlusOne");
  const wantsBadge = form.watch("wantsAttendeeBadge");
  const isLoading = submitStage !== "idle";

  const onSubmit = async (data: RegistrationInput) => {
    try {
      setSubmitStage("registering");

      const regData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || undefined,
        conferenceYear: data.conferenceYear,
        volunteer: data.volunteer,
        volunteerRole: data.volunteerRole || undefined,
        plusOne: data.hasPlusOne && data.plusOne
          ? {
              firstName: data.plusOne.firstName,
              lastName: data.plusOne.lastName,
              email: data.plusOne.email,
              phone: data.plusOne.phone || undefined,
            }
          : undefined,
        wantsAttendeeBadge: data.wantsAttendeeBadge,
      };

      const created = await createRegistration.mutateAsync({ data: regData });

      let delivered = false;

      if (data.wantsAttendeeBadge && data.portraitFile && created.badgeUploadToken) {
        const file = data.portraitFile as File;
        try {
          setSubmitStage("preparing");
          const uploadUrlRes = await requestUploadUrl.mutateAsync({
            registrationId: created.id,
            data: {
              token: created.badgeUploadToken,
              name: file.name,
              size: file.size,
              contentType: file.type as "image/jpeg" | "image/png" | "image/webp",
            },
          });

          setSubmitStage("uploading");
          const putRes = await fetch(uploadUrlRes.uploadURL, {
            method: "PUT",
            headers: {
              "Content-Type": file.type,
            },
            body: file,
          });

          if (!putRes.ok) {
            throw new Error(`Upload failed with status: ${putRes.status}`);
          }

          setSubmitStage("finishing");
          const completion = await completeBadge.mutateAsync({
            registrationId: created.id,
            data: {
              token: created.badgeUploadToken,
              objectPath: uploadUrlRes.objectPath,
            },
          });
          delivered = completion.badgeDeliveryStatus === "delivered";
        } catch (err: any) {
          await skipBadge.mutateAsync({
            registrationId: created.id,
            data: {
              token: created.badgeUploadToken,
            },
          });
          toast({
            title: "Badge Generation Failed",
            description: "We registered you successfully, but there was an issue generating your badge. Your standard confirmation email has been sent.",
            variant: "destructive",
          });
        }
      }

      setBadgeDelivered(delivered);
      setRegisteredPlusOne(data.hasPlusOne);
      setIsSuccess(true);
    } catch (error: any) {
      setSubmitStage("idle");
      if (error.status === 409) {
        toast({
          title: "Already Registered",
          description: error.data?.error || "One of these attendees is already registered for Shalom 2026.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration Failed",
          description: error.data?.error || error.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center space-y-8 p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl relative overflow-hidden"
        >
          {badgeDelivered && (
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-primary/20 rounded-full blur-[50px] pointer-events-none" />
          )}
          <div className="flex justify-center relative z-10">
            <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center text-primary shadow-[0_0_30px_rgba(234,88,12,0.3)]">
              <CheckCircle2 className="h-10 w-10" />
            </div>
          </div>
          <div className="space-y-4 relative z-10">
            <h1
              className="text-4xl font-bold italic text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Thank You!
            </h1>
            <p className="text-white/70 text-lg">
              Your registration{registeredPlusOne ? " and your plus one’s registration" : ""} for Shalom 2026 is confirmed. We can't wait to worship with you.
            </p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 mt-6"
            >
              <p className="text-white/90 text-sm font-medium">
                {registeredPlusOne
                  ? `Confirmation emails have been sent to both attendees${badgeDelivered ? ", including your personalized badge" : ""}.`
                  : badgeDelivered
                  ? "Your confirmation email with your personalized badge attached has been sent."
                  : "Your confirmation email has been sent."}
              </p>
            </motion.div>
          </div>
          <Button asChild className="w-full h-14 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-bold uppercase tracking-widest border-none hover:shadow-[0_0_30px_rgba(234,88,12,0.4)] transition-all">
            <Link href="/">Back to Home</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground relative pb-20">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 rounded-full bg-secondary/10 blur-[100px]" />
      </div>

      <SiteHeader />

      <main className="container relative z-10 mx-auto max-w-2xl px-4 mt-8">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-8"
          >
            <img src={shalomLogo} alt="SHALOM" className="h-16 w-auto" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl sm:text-7xl font-bold uppercase italic text-white mb-6"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Register
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 border border-white/10 backdrop-blur-sm text-sm font-bold">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-white/90">Oct 9-10, 2026</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 border border-white/10 backdrop-blur-sm text-sm font-bold">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-white/90">Windsor Mill, MD</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 border border-white/10 backdrop-blur-sm text-sm font-bold">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-white/90">John 14:26-27</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl"
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/50 uppercase tracking-widest text-xs font-bold">
                        First Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John"
                          {...field}
                          className="bg-white/5 border-white/10 h-14 rounded-xl text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/20"
                          data-testid="input-firstName"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/50 uppercase tracking-widest text-xs font-bold">
                        Last Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Doe"
                          {...field}
                          className="bg-white/5 border-white/10 h-14 rounded-xl text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/20"
                          data-testid="input-lastName"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/50 uppercase tracking-widest text-xs font-bold">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        {...field}
                        className="bg-white/5 border-white/10 h-14 rounded-xl text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/20"
                        data-testid="input-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field: { value, ...rest } }) => (
                  <FormItem>
                    <FormLabel className="text-white/50 uppercase tracking-widest text-xs font-bold">
                      Phone Number (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+1 (555) 000-0000"
                        value={value ?? ""}
                        {...rest}
                        className="bg-white/5 border-white/10 h-14 rounded-xl text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/20"
                        data-testid="input-phone"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hasPlusOne"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (!checked) form.setValue("plusOne", undefined);
                        }}
                        className="mt-1 border-white/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        data-testid="checkbox-plus-one"
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel className="cursor-pointer text-base font-bold text-white">
                        I’m registering a plus one
                      </FormLabel>
                      <p className="text-sm text-white/50">
                        Add one additional attendee to your registration.
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <AnimatePresence>
                {hasPlusOne && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-5 rounded-2xl border border-primary/20 bg-primary/5 p-5">
                      <div>
                        <p className="text-sm font-bold uppercase tracking-widest text-white">Plus one details</p>
                        <p className="mt-1 text-sm text-white/50">Their confirmation email will be sent separately.</p>
                      </div>

                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="plusOne.firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase tracking-widest text-white/50">
                                First Name
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Jane"
                                  {...field}
                                  value={field.value ?? ""}
                                  className="h-14 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/20"
                                  data-testid="input-plus-one-firstName"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="plusOne.lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase tracking-widest text-white/50">
                                Last Name
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Doe"
                                  {...field}
                                  value={field.value ?? ""}
                                  className="h-14 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/20"
                                  data-testid="input-plus-one-lastName"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="plusOne.email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-white/50">
                              Email Address
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="jane@example.com"
                                {...field}
                                value={field.value ?? ""}
                                className="h-14 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/20"
                                data-testid="input-plus-one-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="plusOne.phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-white/50">
                              Phone Number (Optional)
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="+1 (555) 000-0000"
                                {...field}
                                value={field.value ?? ""}
                                className="h-14 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/20"
                                data-testid="input-plus-one-phone"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <FormField
                control={form.control}
                name="volunteer"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (!checked) form.setValue("volunteerRole", "");
                        }}
                        className="mt-1 border-white/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        data-testid="checkbox-volunteer"
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel className="text-white font-bold text-base cursor-pointer">
                        I would like to volunteer
                      </FormLabel>
                      <p className="text-white/50 text-sm">
                        Help us make Shalom 2026 an unforgettable experience. We'll reach out with details.
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              {isVolunteer && (
                <FormField
                  control={form.control}
                  name="volunteerRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/50 uppercase tracking-widest text-xs font-bold">
                        Volunteer Role
                      </FormLabel>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {VOLUNTEER_ROLES.map((role) => {
                          const selected = field.value === role;
                          return (
                            <button
                              key={role}
                              type="button"
                              onClick={() => field.onChange(role)}
                              className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide border transition-all ${
                                selected
                                  ? "bg-primary border-primary text-white"
                                  : "bg-white/5 border-white/10 text-white/60 hover:border-primary/50 hover:text-white"
                              }`}
                            >
                              {role}
                            </button>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="wantsAttendeeBadge"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (!checked) form.setValue("portraitFile", undefined);
                        }}
                        className="mt-1 border-white/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        data-testid="checkbox-badge"
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel className="text-white font-bold text-base cursor-pointer">
                        I want a personalized "I'm Attending" badge
                      </FormLabel>
                      <p className="text-white/50 text-sm">
                        Receive a custom digital badge with your portrait to share with friends.
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <AnimatePresence>
                {wantsBadge && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 pb-2">
                      <FormField
                        control={form.control}
                        name="portraitFile"
                        render={({ field: { value, onChange } }) => (
                          <FormItem>
                            <FormLabel className="text-white/50 uppercase tracking-widest text-xs font-bold">
                              Portrait Photo
                            </FormLabel>
                            <FormControl>
                              <PortraitUpload value={value} onChange={onChange} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-16 whitespace-normal rounded-full bg-gradient-to-r from-primary to-secondary text-xl font-bold uppercase leading-tight tracking-widest text-center text-white shadow-[0_0_30px_rgba(234,88,12,0.4)] hover:shadow-[0_0_50px_rgba(234,88,12,0.6)] transition-all border-none mt-4 relative overflow-hidden"
                data-testid="button-submit"
              >
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-3 absolute inset-0 justify-center"
                    >
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="text-lg">{STAGE_MESSAGES[submitStage]}</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 absolute inset-0 justify-center"
                    >
                      Confirm Registration <ArrowRight className="h-6 w-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* Invisible placeholder to keep the height structure */}
                <div className="opacity-0 flex items-center gap-2">Confirm Registration <ArrowRight className="h-6 w-6" /></div>
              </Button>
            </form>
          </Form>
        </motion.div>
      </main>
    </div>
  );
}

export default function Register() {
  const isBadgeOnly = new URLSearchParams(window.location.search).get("badge") === "1";
  return isBadgeOnly ? <ExistingRegistrationBadge /> : <RegistrationForm />;
}
