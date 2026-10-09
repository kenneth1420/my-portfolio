"use client";

import { Loader2, Send } from "lucide-react";
import { useContactForm } from "@/src/hook/use.contact.form.hook";

const inputClass =
  "w-full bg-subtle border border-border rounded-xl px-4 py-3 text-text text-sm placeholder-muted focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 transition-[border-color,box-shadow] aria-invalid:border-red-400/70";

const labelClass = "block text-muted text-xs font-mono mb-2";

const FIELDS = [
  { name: "name", label: "NAME", type: "text", autoComplete: "name", placeholder: "Your name" },
  { name: "email", label: "EMAIL", type: "email", autoComplete: "email", placeholder: "your@email.com" },
] as const;

/** Message form — validated twice, then opened in the visitor's mail app. */
export default function ContactForm() {
  const { register, onSubmit, errors, isSubmitting } = useContactForm();

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        {FIELDS.map((field) => (
          <div key={field.name}>
            <label htmlFor={`contact-${field.name}`} className={labelClass}>
              {field.label}
            </label>
            <input
              id={`contact-${field.name}`}
              type={field.type}
              autoComplete={field.autoComplete}
              placeholder={field.placeholder}
              aria-invalid={errors[field.name] ? true : undefined}
              aria-describedby={errors[field.name] ? `contact-${field.name}-error` : undefined}
              className={inputClass}
              {...register(field.name)}
            />
            <FieldError id={`contact-${field.name}-error`} message={errors[field.name]?.message} />
          </div>
        ))}
      </div>
      <div>
        <label htmlFor="contact-subject" className={labelClass}>
          SUBJECT
        </label>
        <input
          id="contact-subject"
          type="text"
          placeholder="What is this about?"
          aria-invalid={errors.subject ? true : undefined}
          aria-describedby={errors.subject ? "contact-subject-error" : undefined}
          className={inputClass}
          {...register("subject")}
        />
        <FieldError id="contact-subject-error" message={errors.subject?.message} />
      </div>
      <div>
        <label htmlFor="contact-message" className={labelClass}>
          MESSAGE
        </label>
        <textarea
          id="contact-message"
          rows={5}
          placeholder="Tell me about your project..."
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          className={`${inputClass} resize-none`}
          {...register("message")}
        />
        <FieldError id="contact-message-error" message={errors.message?.message} />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-shine group w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-primary text-neutral-950 font-semibold text-sm hover:bg-primary-light transition-colors duration-200 shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-wait"
      >
        {isSubmitting ? (
          <Loader2 size={15} className="animate-spin motion-reduce:animate-none" />
        ) : (
          <Send
            size={15}
            className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        )}
        {isSubmitting ? "Checking…" : "Open in email app"}
      </button>
    </form>
  );
}

interface IFieldErrorProps {
  id: string;
  message?: string;
}

function FieldError({ id, message }: IFieldErrorProps) {
  if (!message) return null;

  return (
    <p id={id} role="alert" className="mt-1.5 text-xs text-red-600 dark:text-red-400">
      {message}
    </p>
  );
}
