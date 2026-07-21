import React from 'react'

const Header = () => {
  return (
    <div className='text-paper max-w-6xl mx-auto flex items-center justify-between py-6 border-b border-[#2a2825]'>
      <div className='flex justify-center items-center gap-3 animate-bounce'>
          <span className='h-2.5 w-2.5 bg-accent rounded-full inline-block animate-pulse'></span>
          <span className='font-display text-3xl'>HIDDEN PROMPT</span>
      </div>

      <div className='flex justify-center items-center gap-2'>
          <span className='h-2.5 w-2.5 bg-green-500 rounded-full inline-block animate-pulse'></span>
          <span className=' text-yellowish font-body pr-4 text-sm'>212 CASES OPEN</span>
          <span className=' text-yellowish font-body text-sm'>FILE NO. 0417</span>
      </div>
    </div>
  )
}

export default Header