import React from 'react'
import { EvidenceCard } from './EvidenceCard'

const Hero = ({onCreateRoom}) => {
  return (
    <section className='text-paper max-w-6xl mx-auto pt-16'>
        <div className='grid grid-cols-1 lg:grid-cols-2 items-center gap-16'>
            
            {/* left column */}
            <div className='flex flex-col gap-4'>

                <div className='flex border font-mono border-accent gap-4 -rotate-1 max-w-fit py-1 px-3 text-accent text-sm'>
                    <span>MULTIPLAYER</span>
                    <span>&middot;</span>
                    <span>GUESS TO WIN</span>
                    <span>&middot;</span>
                    <span>LIVE ROOMS</span>
                </div>

            <span className='text-6xl font-display leading-18'>Four prompts. One pick.</span>

            <span className='text-6xl font-display leading-18 -rotate-1'>Everyone else has to 
                <span className='bg-black text-transparent mx-2 hover:bg-zinc-800 hover:text-white transition-colors duration-600 cursor-pointer rounded px-1.5 py-0.5 select-none hover:select-auto'>type it</span>.</span>

                <p className='text-yellowish font-mono text-sm text-justify tracking-normal leading-loose pt-2 max-w-5xl '>Every round deals out a lineup of options — volcano, dragon, teacup, comet. One player secretly picks one. The AI paints only that pick. Everyone else studies the evidence and points to the option they think it was.</p>

                {/* button div */}
                <div className='flex items-center gap-6 '>

                    <button className='bg-accent py-4 px-6 transform-3d font-mono cursor-pointer text-sm transition-transform hover:-translate-y-1'
                    onClick={onCreateRoom}
                    >CREATE ROOM</button>

                    <button className='py-3.5 px-6 cursor-pointer border-2 border-paper font-mono text-sm transition-transform hover:-translate-y-1'>JOIN ROOM</button>
                </div>
                {/* button div end */}
                
            </div>

            {/* right column */}
            <div className='w-full rotate-2 max-w-lg mx-auto'>
                              
                <div className='bg-[#E9DFC4] p-4 relative'>

                      <div className='flex justify-between items-center mb-1 px-1 font-mono absolute -top-3 left-4 right-4 z-10'>

                        {/* left badge */}
                        <span className=' text-xs bg-red-950 text-red-400 border border-red-800/80 font-semibold py-1 px-2.5 tracking-widest uppercase rounded-sm shadow-sm -rotate-3'>EXHIBIT A</span>
                        
                        {/* right badge */}
                        <span className=' text-xs bg-zinc-900 text-amber-500 border border-zinc-700/80 font-semibold py-1 px-2.5 tracking-wider uppercase rounded-sm shadow-sm rotate-3'>FILE NO. 0417</span>

                    </div>

                    {/* gradient part */}
                    <div className='w-full h-100 border border-amber-900/40 bg-gradient-to-br from-amber-800/80 via-amber-950 to-zinc-950 shadow-inner flex items-center justify-center relative overflow-hidden group'>
                        {/* Subtle Radial Glow in the center */}
                        <div className='absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,119,6,0.4)_0%,transparent_70%)] pointer-events-none'></div>

                    </div>

                    {/* prompt */}
                    <div className='flex flex-col text-ink font-mono my-4 gap-3'>
                        <p className='text-xs'>THE 4 PROMPTS THE PICKER SAW</p> 

                        <div className='flex gap-3 text-sm'>
                           <span className='border border-black py-1 px-3'>VOLCANO</span>
                           {/* secret text */}
                           <span className='group relative inline-block border border-black py-1 px-3 bg-black text-transparent hover:bg-transparent hover:text-red-700 transition-colors duration-600 hover:border-red-600'>DRAGON

                            {/* hover badge */}
                            <span className='absolute -top-3 -right-2 hidden group-hover:inline-block bg-red-700 text-white text-[9px] font-mono font-bold px-1 rounded shadow border border-red-500 uppercase tracking-widest'>Classified</span>
                           </span>

                           <span className='border border-black py-1 px-3'>TEACUP</span>
                           <span className='border border-black py-1 px-3'>COMET</span>
                        </div>

                        <p className='text-xs'>hover or focus to declassify their pick</p>

                        <hr/>

                        <p className='text-xs'>WHAT THE ROOM TYPED — NOBODY SAW THE LIST ABOVE</p>

                        <div className='flex gap-3 text-sm'>
                           <span className='border border-[#a8a090] py-1 px-3'>"fox"</span>
                           <span className='border border-[#a8a090] py-1 px-3'>"pheonix"</span>
                           <span className='border border-green-700 text-green-700 py-1 px-3 '>"dragon" <span className='text-green-700'>&#10003;</span></span>
                           <span className='border border-[#a8a090] py-1 px-3'>"lizard"</span>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    </section>
  )
}

export default Hero