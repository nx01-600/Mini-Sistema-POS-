export default function Home() {
  return (
    <main className="flex flex-col items-center gap-6 text-white">
      <h1 className="text-5xl font-extrabold drop-shadow-lg">
        🚀 Tailwind Animations
      </h1>

      <button className="px-6 py-3 bg-pink-500 text-white font-bold rounded-xl shadow-lg 
                         hover:scale-110 hover:rotate-3 hover:bg-pink-600 
                         transition-transform duration-300">
        Hover Me
      </button>

      <div className="p-4 bg-yellow-400 text-black rounded-lg cursor-pointer 
                      hover:animate-[wiggle_0.3s_ease-in-out_infinite]">
        Wiggle Box 🌀
      </div>
    </main>
  );
}
