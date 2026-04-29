export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-[880px] px-4 pb-8 pt-4 sm:px-8 sm:pb-12 sm:pt-6 lg:px-12 lg:pb-16">
      <h1 className="mb-6 text-xl font-semibold">Contact</h1>

      <form className="flex max-w-xl flex-col gap-4">
        <input
          type="text"
          placeholder="Name"
          className="border p-2.5 text-sm sm:text-base"
        />
        <input
          type="email"
          placeholder="Email"
          className="border p-2.5 text-sm sm:text-base"
        />
        <textarea
          placeholder="Message"
          rows={5}
          className="border p-2.5 text-sm sm:text-base"
        />

        <button
          type="submit"
          className="self-start bg-black px-6 py-2 text-sm text-white sm:text-base"
        >
          Send
        </button>
      </form>
    </div>
  );
}
