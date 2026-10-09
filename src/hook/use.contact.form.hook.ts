import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { validateContactMessage } from "@/src/app/actions";
import { site } from "@/src/data/site";
import { contactSchema, type ContactValues } from "@/src/lib/contact.schema";

const EMPTY: ContactValues = { name: "", email: "", subject: "", message: "" };

/** `mailto:` only reads `subject` and `body`, so the sender is signed into the body. */
const toMailto = ({ name, email, subject, message }: ContactValues) =>
  `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    `${message}\n\n— ${name} · ${email}`,
  )}`;

/**
 * The contact form: checked in the browser as the visitor types, checked
 * again by a Server Action on submit, then handed to their own email app
 * with everything pre-written. Nothing is sent from this site, and the
 * toast says so.
 */
export function useContactForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: EMPTY,
    mode: "onTouched",
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await validateContactMessage(values);

      if (!result.ok) {
        Object.entries(result.fieldErrors).forEach(([field, message]) =>
          setError(field as keyof ContactValues, { message }),
        );
        toast.error(result.message);
        return;
      }

      window.location.assign(toMailto(result.values));
      toast.success("Opening your email app", {
        description: "Your message is written and ready. Press send there to deliver it.",
      });
    } catch {
      toast.error("Couldn't check your message", {
        description: `Email me directly at ${site.email}.`,
      });
    }
  });

  return { register, onSubmit, errors, isSubmitting };
}
