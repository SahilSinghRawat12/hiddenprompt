

const Hero = ({ onCreateRoom, onJoinRoom }: { onCreateRoom?: () => void; onJoinRoom?: () => void }) => {
  return (
    <section className='text-paper max-w-6xl mx-auto pt-8 sm:pt-12 lg:pt-16 px-4 sm:px-6 lg:px-8'>
      <div className='grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-16'>
        
        {/* Left Column */}
        <div className='flex flex-col gap-4 sm:gap-6 text-center sm:text-left items-center sm:items-start'>

          {/* Top Tagline Badges */}
          <div className='flex flex-wrap justify-center sm:justify-start border font-mono border-accent gap-2 sm:gap-4 -rotate-1 max-w-fit py-1 px-3 text-accent text-xs sm:text-sm'>
            <span>MULTIPLAYER</span>
            <span>&middot;</span>
            <span>GUESS TO WIN</span>
            <span>&middot;</span>
            <span>LIVE ROOMS</span>
          </div>

          {/* Main Headings */}
          <h1 className='text-3xl sm:text-5xl lg:text-6xl font-display leading-tight sm:leading-snug lg:leading-18'>
            Four prompts. One pick.
          </h1>

          <h2 className='text-3xl sm:text-5xl lg:text-6xl font-display leading-tight sm:leading-snug lg:leading-18 -rotate-1'>
            Everyone else has to{' '}
            <span className='bg-black text-transparent mx-1 sm:mx-2 hover:bg-zinc-800 hover:text-white transition-colors duration-500 cursor-pointer rounded px-1.5 py-0.5 select-none hover:select-auto inline-block'>
              type it
            </span>
            .
          </h2>

          {/* Description Paragraph */}
          <p className='text-yellowish font-mono text-xs sm:text-sm text-left sm:text-justify tracking-normal leading-relaxed sm:leading-loose pt-2 max-w-2xl'>
            Every round deals out a lineup of options — volcano, dragon, teacup, comet. One player secretly picks one. The AI paints only that pick. Everyone else studies the evidence and points to the option they think it was.
          </p>

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto pt-2'>
            <button
              className='w-full sm:w-auto bg-accent py-3.5 sm:py-4 px-6 transform-3d font-mono cursor-pointer text-sm font-bold transition-transform hover:-translate-y-1 active:translate-y-0 text-center'
              onClick={onCreateRoom}
            >
              CREATE ROOM
            </button>

            <button
              className='w-full sm:w-auto py-3.5 px-6 cursor-pointer border-2 border-paper font-mono text-sm font-bold transition-transform hover:-translate-y-1 active:translate-y-0 text-center'
              onClick={onJoinRoom}
            >
              JOIN ROOM
            </button>
          </div>

        </div>

        {/* Right Column (Card Exhibit) */}
        <div className='w-full rotate-1 sm:rotate-2 max-w-md lg:max-w-lg mx-auto mt-4 lg:mt-0'>
          
          <div className='bg-[#E9DFC4] p-3 sm:p-4 relative shadow-lg'>

            {/* Top Badges Header */}
            <div className='flex justify-between items-center mb-1 px-1 font-mono absolute -top-3 left-2 right-2 sm:left-4 sm:right-4 z-10'>
              {/* Left badge */}
              <span className='text-[10px] sm:text-xs bg-red-950 text-red-400 border border-red-800/80 font-semibold py-0.5 sm:py-1 px-2 sm:px-2.5 tracking-widest uppercase rounded-sm shadow-sm -rotate-3'>
                EXHIBIT A
              </span>
              
              {/* Right badge */}
              <span className='text-[10px] sm:text-xs bg-zinc-900 text-amber-500 border border-zinc-700/80 font-semibold py-0.5 sm:py-1 px-2 sm:px-2.5 tracking-wider uppercase rounded-sm shadow-sm rotate-3'>
                FILE NO. 0417
              </span>
            </div>

            {/* Image Placeholder Container */}
            <div className='w-full h-64 sm:h-80 lg:h-96 border border-amber-900/40 bg-gradient-to-br from-amber-800/80 via-amber-950 to-zinc-950 shadow-inner flex items-center justify-center relative overflow-hidden group mt-2 sm:mt-0'>
              {/* Subtle Radial Glow in center */}
              <div className='absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,119,6,0.4)_0%,transparent_70%)] pointer-events-none'></div>
            </div>

            {/* Evidence & Guesses Section */}
            <div className='flex flex-col text-ink font-mono my-3 sm:my-4 gap-2.5 sm:gap-3'>
              <p className='text-[11px] sm:text-xs font-bold uppercase tracking-wider'>
                THE 4 PROMPTS THE PICKER SAW
              </p> 

              {/* 4 Prompts list */}
              <div className='flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm'>
                <span className='border border-black py-1 px-2.5 sm:px-3'>VOLCANO</span>
                
                {/* Secret word trigger */}
                <span className='group relative inline-block border border-black py-1 px-2.5 sm:px-3 bg-black text-transparent hover:bg-transparent hover:text-red-700 transition-colors duration-500 hover:border-red-600 cursor-pointer'>
                  DRAGON

                  {/* Hover badge */}
                  <span className='absolute -top-3 -right-2 hidden group-hover:inline-block bg-red-700 text-white text-[8px] sm:text-[9px] font-mono font-bold px-1 rounded shadow border border-red-500 uppercase tracking-widest z-20'>
                    Classified
                  </span>
                </span>

                <span className='border border-black py-1 px-2.5 sm:px-3'>TEACUP</span>
                <span className='border border-black py-1 px-2.5 sm:px-3'>COMET</span>
              </div>

              <p className='text-[10px] sm:text-xs text-zinc-600 italic'>
                hover or focus to declassify their pick
              </p>

              <hr className='border-zinc-400 my-1' />

              <p className='text-[11px] sm:text-xs font-bold uppercase tracking-wider'>
                WHAT THE ROOM TYPED — NOBODY SAW THE LIST ABOVE
              </p>

              {/* Typed guesses list */}
              <div className='flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm'>
                <span className='border border-[#a8a090] py-1 px-2.5 sm:px-3'>"fox"</span>
                <span className='border border-[#a8a090] py-1 px-2.5 sm:px-3'>"pheonix"</span>
                <span className='border border-green-700 text-green-700 py-1 px-2.5 sm:px-3 font-bold bg-green-500/10'>
                  "dragon" <span className='text-green-700 ml-0.5'>&#10003;</span>
                </span>
                <span className='border border-[#a8a090] py-1 px-2.5 sm:px-3'>"lizard"</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}

export default Hero