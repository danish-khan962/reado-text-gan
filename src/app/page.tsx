import Footer from '@/modules/footer/footer'
import Hero from '@/modules/home/hero'
import Navbar from '@/modules/navbar/navbar'
import MaxWidthContainer from '@/style/max-width-container'
import React from 'react'

const Page = () => {
  return (
    <MaxWidthContainer className='min-h-screen flex flex-col justify-between items-center gap-y-20'>
      <Navbar />
      <Hero />
      <Footer />
    </MaxWidthContainer>
  )
}

export default Page