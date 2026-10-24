"use client"

import CustomButton from '@/components/custom-button'
import { Badge } from '@/components/ui/badge'
import { SparklesIcon, TextInitialIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const Hero = () => {
    return (
        <div className='flex flex-col justify-center items-center gap-5'>
            <Badge className='px-5 h-8 flex gap-3 bg-white/90 shadow-xl'>
                <SparklesIcon className='h-4 w-4' fill='teal' stroke='teal' />
                <span className='text-teal-700 font-semibold text-xs'>
                    Context-Aware Text GAN
                </span>
            </Badge>


            {/* CTA */}
            <div className='-z-9 flex flex-col items-center rounded-2xl text-center'>

                <h1 className='font-extrabold tracking-tight text-4xl sm:text-5xl md:text-6xl xl:text-7xl leading-snug'>
                    Neural Summarization on Your Terms
                </h1>

                <p className='max-w-4xl text-center text-xs sm:text-sm'>
                    Transform dense articles and technical papers into contextually precise digests. Switch effortlessly between Easy, Hard, and Editorial tiers powered by sequence-to-sequence deep generative modeling
                </p>
            </div>

            <div className='flex fle-row gap-4 items-center'>
                <Link href={"/dashboard"}>
                    <CustomButton
                        className='shadow-[1px_1px_16px_#121212]'
                    >
                        Start Summarizing
                    </CustomButton>
                </Link>
                <CustomButton
                    className='from-zinc-50 via-zinc-100 to-zinc-200 text-neutral-900 font-semibold border-b-2 border-gray-400'
                >
                    View Metrics
                </CustomButton>
            </div>
        </div>
    )
}

export default Hero