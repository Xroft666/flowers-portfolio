export default function ContactPage() {
  return (
    <div className="p-12 max-w-xl">
      <h1 className="text-xl font-semibold mb-6">Contact</h1>

      <form className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Name"
          className="border p-2 text-sm"
        />
        <input
          type="email"
          placeholder="Email"
          className="border p-2 text-sm"
        />
        <textarea
          placeholder="Message"
          rows={5}
          className="border p-2 text-sm"
        />

        <button
          type="submit"
          className="self-start px-6 py-2 bg-black text-white text-sm"
        >
          Send
        </button>
      </form>
    </div>
  );
}
