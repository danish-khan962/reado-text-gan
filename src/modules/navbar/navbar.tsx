"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import CustomButton from '@/components/custom-button'
import { ChevronRightIcon, Menu, X } from 'lucide-react'
import { usePathname } from 'next/navigation'

const navigationItem = [
    {
        name: "Overview",
        url: "/overviw"
    },
    {
        name: "Complexity Tiers",
        url: "/complexity-tiers"
    },
    {
        name: "Architecture",
        url: "/architecture"
    },
    {
        name: "Benchmarks",
        url: "/benchmarks"
    },
]

const Navbar = () => {

    const pathname = usePathname();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    }

    return (
        <nav className='max-w-5xl w-full flex flex-row justify-between items-center gap-5 bg-white/30 backdrop-blur-lg p-3 rounded-full shadow-xl'>
            <Link
                href={"/"}
                className='flex flex-row items-center gap-2'
            >
                <Image
                    src={"/logo.svg"}
                    alt='logo'
                    height={1000}
                    width={1000}
                    className='h-6 w-6 md:h-8 md:w-8 xl:h-10 xl:w-10'
                />
                <h4 className='font-extrabold text-lg md:text-xl xl:text-2xl tracking-tighter'>
                    Reado.AI
                </h4>
            </Link>

            <ul className='hidden lg:flex flex-row items-center gap-8'>
                {
                    navigationItem.map((item, index) => (
                        <Link
                            key={index}
                            href={item.url}
                            className='font-medium text-sm hover:opacity-95 transition-all ease-in-out duration-200 hover:font-semibold tracking-tight'
                        >
                            {item.name}
                        </Link>
                    ))
                }
            </ul>

            <div className='relative flex flex-row items-center gap-4'>
                <Link href={"/dashboard"} >
                    <CustomButton>
                        Launch App
                    </CustomButton>
                </Link>

                <div
                    onClick={toggleDropdown}
                    className='flex lg:hidden bg-white/60 hover:bg-white/70 transition-all ease-in-out duration-200 rounded-full p-2 cursor-pointer'>
                    {dropdownOpen ? (<X className='h-3.5 w-3.5' />) : (<Menu className='h-3.5 w-3.5' />)}
                </div>
            </div>


            {
                dropdownOpen && (
                    <div className='absolute z-99 bg-radial from-zinc-100 to-zinc-200 shadow-[1px_1px_12px_#ADADAD] top-20 right-0 max-w-md w-full flex flex-col gap-8 p-6 sm:p-8 rounded-2xl'>
                        {
                            navigationItem.map((item, index) => (
                                <Link
                                    key={index}
                                    href={item.url}
                                    className='font-medium tracking-tight text-xs sm:text-sm md:text-base'
                                >
                                    {item.name}
                                </Link>
                            ))
                        }
                    </div>
                )
            }
        </nav>
    )
}

export default Navbar