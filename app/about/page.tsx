export default function AboutPage() {
  return (
    <div className="p-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

        {/* IMAGE */}
        <div className="flex justify-end">
          <img
            src="/content/about.jpeg"
            alt="About Komorebi"
            className="w-1/1.5 h-auto"
          />
        </div>

        {/* TEXT */}
        <div className="max-w-md text-sm leading-relaxed">
          <p className="mb-4">
            <strong>Komorebi</strong> is the expertise behind the floral artist
            Inna Saraeva, member of the Japanese flower arrangement school
            Ikebana Ikenobo.
          </p>

          <p>
            Ikebana is a perfectionistic art of floral subtraction, rooted in the
            ancient practice of Buddhist temple offerings. The practice
            celebrates the gentle imperfections of nature, serving as a
            meditation on impermanence and embodying the principle of
            mono-no-aware — the profound awareness of the transient beauty of
            life.
          </p>
        </div>

      </div>
    </div>
  );
}
