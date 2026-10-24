"use client"

import { cn } from 'cn';
import React from 'react'

interface Props{
    className?: string;
    children?: React.ReactNode
}

const CustomButton = ({
    className, children
} : Props) => {
  return (
    <button
        className={cn(
            "flex flex-row justify-center items-center gap-2 px-6 py-3 rounded-full font-medium bg-linear-to-tr from-neutral-700 via-neutral-800 to-neutral-950 text-white text-xs md:text-sm cursor-pointer active:-translate-y-0.5 tracking-tight group transition-all ease-in-out duration-200  shadow-[1px_1_20px_#BABABA] hover:opacity-90",
            className
        )}
    >
        {children}
    </button>
  )
}

export default CustomButton