const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 pb-8 pt-4 sm:px-8 sm:pb-12 sm:pt-6 lg:px-12 lg:pb-16">
      <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2">

        {/* IMAGE */}
        <div className="order-1 flex justify-center md:justify-end">
          <img
            src={`${BASE_PATH}/about/about.jpeg`}
            alt="About Komorebi"
            className="h-auto w-full max-w-md"
          />
        </div>

        {/* TEXT */}
        <div className="order-2 max-w-xl text-sm leading-relaxed sm:text-base">
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
