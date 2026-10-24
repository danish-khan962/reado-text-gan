"use client"

import { cn } from 'cn';
import React from 'react'

interface Props{
    children?: React.ReactNode;
    className?: string;
}

const MaxWidthContainer = ({
    children, className
} : Props) => {
  return (
    <div
        className={cn(
            "max-w-5xl w-full p-4 md:p-5 lg:p-8 mx-auto",
            className
        )}
    >
        {children}
    </div>
  )
}

export default MaxWidthContainer