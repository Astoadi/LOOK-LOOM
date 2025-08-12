import React from 'react'
//bg-gray-900
export default function LoadingCursor() {
  return (
    <div className="outer_div flex min-h-screen min-w-screen justify-center items-center bg-gradient-to-r from-gray-900 to-black font-sans">
        <div className="inner_div h-32 w-32 border-[10px] border-t-[#faa92f] border-b-[#faa92f] border-l-transparent border-r-transparent rounded-full animate-spin shadow-xl"></div>
    </div>  
  )
}
