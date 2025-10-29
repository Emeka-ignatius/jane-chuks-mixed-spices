import { ContactContent } from "@/components/static/contact-content";

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <ContactContent />
    </div>
  );
}

export const metadata = {
  title: "Contact Us - BioHaven",
  description:
    "Get in touch with BioHaven. We're here to help with your questions and orders.",
};
