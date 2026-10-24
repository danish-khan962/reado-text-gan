"use client"

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FaGithub } from "react-icons/fa6"
import { redirect } from 'next/navigation'

const Footer = () => {
  return (
    <footer className='w-full bg-black p-4 rounded-2xl text-neutral-400 flex flex-col justify-center items-center gap-5'>
      {/* <div
        className='inline-flex flex-row items-center gap-2 bg-radial from-teal-50 to-emerald-50 py-2 px-5 rounded-2xl border border-neutral-700 shadow-[#ffffff]/60 shadow-md'
      >
        <Image
          src={"/logo.svg"}
          alt='logo'
          height={1000}
          width={1000}
          className='h-6 w-6 md:h-8 md:w-8 xl:h-10 xl:w-10'
        />
        <h4 className='font-extrabold text-lg md:text-xl xl:text-2xl tracking-tighter text-black'>
          Reado.AI
        </h4>
      </div> */}

      <div className='text-xs text-center leading-loose'>
        Developed by {" "}
        <Link
          href={"https://github.com/danish-khan962"}
          target='_blank'
          className='font-medium text-white/90 hover:underline'
        >
          Danish Khan
        </Link>
        <br />
        Under Supervision of {" "} 
        <Link
          href={"#"}
          target='_blank'
          className='font-medium text-white/90 hover:underline'
        >
          Dr. Neha Yadav
        </Link>
      </div>

      <div className='flex items-center text-sm text-white gap-2'>
        <FaGithub className='h-5 w-5' />
        <span 
        className='font-medium tracking-tighter cursor-pointer'>
          <Link href={"#"}>
            View Repository
          </Link>
        </span>
      </div>
    </footer>
  )
}

export default Footer